/**
 * Autenticació d'usuaris.
 */

function loginUser(email, password) {
    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
        return { status: 'error', message: 'Credencials incorrectes' };
    }
    const sheet = getSheet('usuaris');
    if (!sheet) return { status: 'error', message: 'Pestanya usuaris no trobada' };

    const data = getCachedSheetValues(sheet);
    if (data.length <= 1) return { status: 'error', message: 'No hi ha usuaris registrats' };

    const headers = data[0].map(normalizeHeader);

    const emailIdx = findHeaderIndex(headers, ['email']);
    const passIdx = findHeaderIndex(headers, ['password']);

    if (emailIdx === -1 || passIdx === -1) {
        return { status: 'error', message: 'Falten les columnes email o password a la pestanya usuaris' };
    }

    // Comencem a la fila 1 perquè la fila 0 són les capçaleres.
    // El correu no distingeix majúscules/minúscules; la contrasenya sí.
    for (let i = 1; i < data.length; i++) {
        if (String(data[i][emailIdx]).toLowerCase() === String(email).toLowerCase() &&
            String(data[i][passIdx]) === String(password)) {

            const user = {};
            data[0].forEach((header, index) => {
                // Mai retornem la contrasenya al navegador.
                if (normalizeHeader(header) !== 'password') {
                    user[header] = data[i][index];
                }
            });

            const response = { status: 'success', user };
            if (isDashboardTeacher_(user)) {
                const token = Utilities.getUuid() + Utilities.getUuid();
                CacheService.getScriptCache().put(dashboardSessionKey_(token), JSON.stringify(user), 21600);
                response.dashboardToken = token;
            }
            return response;
        }
    }

    return { status: 'error', message: 'Credencials incorrectes' };
}

function isDashboardTeacher_(user) {
    const role = String(user.rol || user.role || '').trim().toLowerCase();
    return role.includes('prof') || role.includes('admin');
}

function dashboardSessionKey_(token) {
    return typeof token === 'string' && /^[a-f0-9-]{72}$/i.test(token)
        ? 'teacher-dashboard:' + token
        : null;
}

function revokeDashboardSession_(token) {
    const key = dashboardSessionKey_(token);
    if (key) CacheService.getScriptCache().remove(key);
    return { status: 'success' };
}
