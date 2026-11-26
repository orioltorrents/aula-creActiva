const PASSWORD_RESET_SECONDS = 900;
const PASSWORD_RESET_RESPONSE = {
    status: 'success',
    message: 'Si el correu està registrat, rebràs un codi de recuperació.'
};

function passwordDigest_(value) {
    return Utilities.base64EncodeWebSafe(Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256, String(value), Utilities.Charset.UTF_8
    ));
}

function matchesPassword_(password, storedValue) {
    const stored = String(storedValue);
    return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(stored)
        ? !bcrypt.truncates(password) && bcrypt.compareSync(password, stored)
        : password === stored;
}

function findPasswordAccount_(email, fresh = false) {
    const address = String(email || '').trim().toLowerCase();
    if (!address) return null;
    const sheet = getSheet('usuaris');
    if (!sheet) return null;

    const values = fresh ? sheet.getDataRange().getValues() : getCachedSheetValues(sheet);
    const headers = (values[0] || []).map(normalizeHeader);
    const emailIndex = headers.indexOf('email');
    const passwordIndex = headers.indexOf('password');
    if (emailIndex < 0 || passwordIndex < 0) return null;

    const index = values.findIndex((row, i) => i > 0 && String(row[emailIndex]).trim().toLowerCase() === address);
    if (index < 0) return null;
    return {
        sheet,
        row: index + 1,
        column: passwordIndex + 1,
        email: String(values[index][emailIndex]).trim(),
        password: values[index][passwordIndex]
    };
}

function validateNewPassword_(value) {
    return typeof value === 'string' && value.trim().length >= 12 && !bcrypt.truncates(value);
}

function writePassword_(account, password) {
    bcrypt.setRandomFallback(length => {
        const hex = Utilities.getUuid().replace(/-/g, '');
        return hex.match(/../g).slice(0, length).map(byte => parseInt(byte, 16));
    });
    const hash = bcrypt.hashSync(password, 12);
    account.sheet.getRange(account.row, account.column).setValue(hash);
    SpreadsheetApp.flush();
    clearSheetCache(account.sheet);
    CacheService.getScriptCache().remove(passwordResetKey_(account.email));
    return { status: 'success', message: 'Contrasenya actualitzada. Ja pots entrar amb la nova.' };
}

function changePassword_(data) {
    if (!validateNewPassword_(data.newPassword)) return invalidNewPassword_();
    return withWriteLock(() => {
        const account = findPasswordAccount_(data.email, true);
        if (!account || typeof data.password !== 'string' || !data.password ||
            !matchesPassword_(data.password, account.password)) {
            return { status: 'error', message: 'La contrasenya actual no és correcta.' };
        }
        return writePassword_(account, data.newPassword);
    });
}

function passwordResetKey_(email) {
    return 'password-reset:' + passwordDigest_(String(email || '').trim().toLowerCase());
}

function requestPasswordReset_(data) {
    const address = String(data.email || '').trim();
    if (address.length > 254 || !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(address)) {
        return PASSWORD_RESET_RESPONSE;
    }

    const cache = CacheService.getScriptCache();
    const key = passwordResetKey_(address);
    const request = withWriteLock(() => {
        if (cache.get(key + ':cooldown')) return null;
        cache.put(key + ':cooldown', '1', 300);
        const account = findPasswordAccount_(address);
        if (!account || MailApp.getRemainingDailyQuota() < 1) return null;
        const code = Utilities.getUuid().replace(/-/g, '');
        cache.put(key, passwordDigest_(code), PASSWORD_RESET_SECONDS);
        return { email: account.email, code };
    });

    if (request?.code) {
        try {
            MailApp.sendEmail({
                to: request.email,
                name: 'Aula CreActiva',
                subject: 'Restableix la contrasenya d’Aula CreActiva',
                body: 'El teu codi de recuperació és:\n\n' + request.code +
                    '\n\nTorna a Aula CreActiva i enganxa el codi a «He oblidat la contrasenya».' +
                    '\nEl codi caduca al cap de 15 minuts i només es pot fer servir una vegada.' +
                    '\nSi no has demanat el canvi, pots ignorar aquest missatge.'
            });
        } catch (error) {
            console.warn('No s’ha pogut enviar el correu de recuperació.');
        }
    }
    return PASSWORD_RESET_RESPONSE;
}

function resetPassword_(data) {
    if (!validateNewPassword_(data.newPassword)) return invalidNewPassword_();
    const code = String(data.code || '').trim().toLowerCase();
    return withWriteLock(() => {
        const expected = CacheService.getScriptCache().get(passwordResetKey_(data.email));
        if (expected && /^[a-f0-9]{32}$/.test(code) && passwordDigest_(code) === expected) {
            const account = findPasswordAccount_(data.email, true);
            if (account) return writePassword_(account, data.newPassword);
        }
        return { status: 'error', message: 'El codi és incorrecte o ha caducat.' };
    });
}

function invalidNewPassword_() {
    return { status: 'error', message: 'La contrasenya ha de tenir almenys 12 caràcters i ocupar com a màxim 72 bytes.' };
}
