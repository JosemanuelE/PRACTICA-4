import LoginGuard from "../models/LoginGuard";

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

const remainingMinutes = (until: Date) =>
    Math.max(1, Math.ceil((until.getTime() - Date.now()) / 60000));

export const getLockMessage = (until: Date) =>
    `Demasiados intentos fallidos. Vuelve a intentarlo en ${remainingMinutes(until)} minuto(s).`;

export const findActiveLock = async (identifiers: string[]) => {
    const rows = await LoginGuard.findAll({ where: { identifier: identifiers } });
    const now = new Date();
    return rows.find((row) => row.lockedUntil && row.lockedUntil > now) ?? null;
};

export const registerLoginFailure = async (identifier: string) => {
    const [row] = await LoginGuard.findOrCreate({
        where: { identifier },
        defaults: { identifier, failCount: 0, lockedUntil: null },
    });

    if (row.lockedUntil && row.lockedUntil > new Date()) {
        return row;
    }

    row.failCount += 1;
    if (row.failCount >= MAX_LOGIN_ATTEMPTS) {
        row.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
    }
    await row.save();
    return row;
};

export const clearLoginFailures = async (identifiers: string[]) => {
    await LoginGuard.destroy({ where: { identifier: identifiers } });
};
