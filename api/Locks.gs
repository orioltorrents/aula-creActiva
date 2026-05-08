/**
 * Helpers de bloqueig per a operacions d'escriptura.
 */

function withWriteLock(callback) {
    const lock = LockService.getScriptLock();

    if (!lock.tryLock(10000)) {
        return { status: 'error', message: 'No s\'ha pogut guardar ara mateix. Torna-ho a provar en uns segons.' };
    }

    try {
        return callback();
    } finally {
        lock.releaseLock();
    }
}
