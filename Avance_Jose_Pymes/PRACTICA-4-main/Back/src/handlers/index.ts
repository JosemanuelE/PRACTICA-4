import { Request, Response } from "express";
import { checkPassword, hashPassword } from "../Utils/auth";
import User from "../models/User";
import AuthToken from "../models/AuthToken";
import jwt from "jsonwebtoken";
import type { AuthedRequest } from "../middleware/userAuth";
import { getClientIp } from "../Utils/clientInfo";
import { writeAudit } from "../Utils/audit";
import {
    clearLoginFailures,
    findActiveLock,
    getLockMessage,
    registerLoginFailure,
} from "../Utils/lockout";
import { createRawToken, hashToken } from "../Utils/tokens";
import { sendVerificationEmail } from "../Utils/mail";

const getSecret = () => process.env.JWT_SECRET || "dev-cambiar-en-produccion";

const guardKeys = (email: string, ip: string) => [
    `user:${email.toLowerCase()}`,
    `ip:${ip}`,
];

const issueVerifyToken = async (userId: number) => {
    await AuthToken.update(
        { usedAt: new Date() },
        { where: { userId, type: "email_verify", usedAt: null } }
    );
    const raw = createRawToken();
    await AuthToken.create({
        userId,
        type: "email_verify",
        tokenHash: hashToken(raw),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return raw;
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body as {
            name?: string;
            email?: string;
            password?: string;
        };

        const normalizedEmail = email?.trim().toLowerCase() || "";
        const userExists = await User.findOne({ where: { email: normalizedEmail } });

        if (userExists) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        const hashedPassword = await hashPassword(password || "");
        const user = await User.create({
            name: (name || "").trim(),
            email: normalizedEmail,
            password: hashedPassword,
            progress: 0,
            role: "user",
            emailVerified: false,
        });

        const rawToken = await issueVerifyToken(user.id);
        const mail = await sendVerificationEmail(user.email, rawToken);

        await writeAudit(req, "register", {
            userId: user.id,
            email: user.email,
            details: "Cuenta creada. Pendiente de confirmar correo.",
        });

        res.status(201).json({
            message:
                "Cuenta creada. Revisa tu correo y confirma el enlace para poder iniciar sesión.",
            email: user.email,
            emailSent: !mail.logged,
            ...(mail.logged && process.env.NODE_ENV !== "production"
                ? {
                      devHint:
                          "No hay SMTP configurado. Copia el enlace de verificación que aparece en la terminal del backend.",
                  }
                : {}),
        });
    } catch (error) {
        res.status(500).json({ message: "Error al crear usuario", error });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body as { email?: string; password?: string };
    const normalizedEmail = email?.trim().toLowerCase() || "";
    const ip = getClientIp(req);
    const keys = guardKeys(normalizedEmail, ip);

    const lock = await findActiveLock(keys);
    if (lock?.lockedUntil) {
        await writeAudit(req, "login_blocked", {
            email: normalizedEmail,
            details: "Intento con bloqueo activo",
        });
        return res.status(429).json({ message: getLockMessage(lock.lockedUntil) });
    }

    const userExists = await User.findOne({ where: { email: normalizedEmail } });
    const passwordOk =
        userExists && password
            ? await checkPassword(password, userExists.password)
            : false;

    if (!userExists || !passwordOk) {
        const failed = await registerLoginFailure(`user:${normalizedEmail}`);
        await registerLoginFailure(`ip:${ip}`);
        await writeAudit(req, "login_failed", {
            userId: userExists?.id ?? null,
            email: normalizedEmail,
            details: "Email o contraseña incorrectos",
        });

        if (failed.lockedUntil && failed.lockedUntil > new Date()) {
            await writeAudit(req, "account_locked", {
                userId: userExists?.id ?? null,
                email: normalizedEmail,
                details: "Bloqueo por 5 intentos fallidos",
            });
            return res.status(429).json({ message: getLockMessage(failed.lockedUntil) });
        }

        return res.status(401).json({ message: "Email o contraseña incorrectos" });
    }

    if (!userExists.emailVerified) {
        await writeAudit(req, "login_unverified", {
            userId: userExists.id,
            email: userExists.email,
        });
        return res.status(403).json({
            message:
                "Debes confirmar tu correo antes de entrar. Revisa tu bandeja o pide un nuevo enlace.",
            code: "EMAIL_NOT_VERIFIED",
        });
    }

    await clearLoginFailures(keys);

    const token = jwt.sign(
        {
            id: userExists.id,
            email: userExists.email,
            role: userExists.role || "user",
        },
        getSecret(),
        { expiresIn: "7d" }
    );

    await writeAudit(req, "login_success", {
        userId: userExists.id,
        email: userExists.email,
        details: `Rol: ${userExists.role}`,
    });

    res.json({
        message: "Autenticación exitosa",
        token,
        user: {
            id: userExists.id,
            name: userExists.name,
            email: userExists.email,
            role: userExists.role,
        },
    });
};

// Devuelve los datos de la sesión activa a partir del JWT del encabezado.
export const getMe = async (req: Request, res: Response) => {
    const userId = (req as AuthedRequest).userId;
    const user = await User.findByPk(userId, {
        attributes: ["id", "name", "email", "role", "emailVerified"],
    });

    if (!user) {
        return res.status(404).json({ message: "La cuenta de esta sesión ya no existe" });
    }

    res.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
        },
    });
};
