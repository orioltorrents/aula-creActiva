/**
 * Autenticació d'usuaris.
 */

function loginUser(email, password) {
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
                if (header !== 'password') {
                    user[header] = data[i][index];
                }
            });

            return { status: 'success', user: user };
        }
    }

    return { status: 'error', message: 'Credencials incorrectes' };
}
