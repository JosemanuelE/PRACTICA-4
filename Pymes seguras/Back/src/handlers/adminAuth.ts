import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getClientIp } from "../Utils/clientInfo";
import { writeAudit } from "../Utils/audit";
import {
    clearLoginFailures,
    findActiveLock,
    getLockMessage,
    registerLoginFailure,
} from "../Utils/lockout";

const getSecret = () => process.env.JWT_SECRET || "dev-cambiar-en-produccion";

export const adminLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body as { email?: string; password?: string };
    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const ip = getClientIp(req);
    const keys = [`admin:${(email || "").trim().toLowerCase()}`, `admin-ip:${ip}`];

    const lock = await findActiveLock(keys);
    if (lock?.lockedUntil) {
        await writeAudit(req, "admin_login_blocked", {
            email: email || null,
            details: "Intento de admin con bloqueo activo",
        });
        return res.status(429).json({ message: getLockMessage(lock.lockedUntil) });
    }

    if (!adminEmail || adminPassword === undefined || adminPassword === "") {
        return res.status(500).json({
            message:
                "Panel admin no configurado: define ADMIN_EMAIL y ADMIN_PASSWORD en .env",
        });
    }

    if (email !== adminEmail || password !== adminPassword) {
        const failed = await registerLoginFailure(`admin:${(email || "").trim().toLowerCase()}`);
        await registerLoginFailure(`admin-ip:${ip}`);
        await writeAudit(req, "admin_login_failed", {
            email: email || null,
            details: "Credenciales de administrador incorrectas",
        });
        if (failed.lockedUntil && failed.lockedUntil > new Date()) {
            await writeAudit(req, "admin_locked", {
                email: email || null,
                details: "Bloqueo del panel admin por intentos fallidos",
            });
            return res.status(429).json({ message: getLockMessage(failed.lockedUntil) });
        }
        return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    await clearLoginFailures(keys);
    await writeAudit(req, "admin_login_success", {
        email: adminEmail,
        details: "Acceso al panel de administración",
    });

    const token = jwt.sign({ role: "admin" }, getSecret(), { expiresIn: "8h" });
    res.json({ token });
};
