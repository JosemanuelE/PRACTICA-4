import type { Request, Response } from "express";
import { Op } from "sequelize";
import User from "../models/User";
import AuthToken from "../models/AuthToken";
import { hashPassword } from "../Utils/auth";
import { writeAudit } from "../Utils/audit";
import { createRawToken, hashToken } from "../Utils/tokens";
import { sendPasswordResetEmail, sendVerificationEmail } from "../Utils/mail";
import { clearLoginFailures } from "../Utils/lockout";
import { getClientIp } from "../Utils/clientInfo";

const GENERIC_RESET_MSG =
    "Si el correo está registrado, te enviaremos un enlace para restablecer la contraseña.";

const issueToken = async (userId: number, type: "email_verify" | "password_reset", hours: number) => {
    await AuthToken.update(
        { usedAt: new Date() },
        { where: { userId, type, usedAt: null } }
    );
    const raw = createRawToken();
    await AuthToken.create({
        userId,
        type,
        tokenHash: hashToken(raw),
        expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
    });
    return raw;
};

const consumeToken = async (raw: string, type: "email_verify" | "password_reset") => {
    if (!raw) return null;
    const token = await AuthToken.findOne({
        where: {
            tokenHash: hashToken(raw),
            type,
            usedAt: null,
            expiresAt: { [Op.gt]: new Date() },
        },
    });
    return token;
};

export const verifyEmail = async (req: Request, res: Response) => {
    const raw = String((req.body as { token?: string }).token || "").trim();
    const token = await consumeToken(raw, "email_verify");
    if (!token) {
        await writeAudit(req, "verify_email_failed", { details: "Token inválido o vencido" });
        return res.status(400).json({ message: "El enlace no es válido o ya caducó." });
    }

    const user = await User.findByPk(token.userId);
    if (!user) {
        return res.status(400).json({ message: "El enlace no es válido o ya caducó." });
    }

    user.emailVerified = true;
    await user.save();
    token.usedAt = new Date();
    await token.save();

    await writeAudit(req, "email_verified", { userId: user.id, email: user.email });
    res.json({ message: "Correo confirmado. Ya puedes iniciar sesión." });
};

export const resendVerification = async (req: Request, res: Response) => {
    const email = String((req.body as { email?: string }).email || "")
        .trim()
        .toLowerCase();
    const user = await User.findOne({ where: { email } });

    if (user && !user.emailVerified) {
        const raw = await issueToken(user.id, "email_verify", 24);
        await sendVerificationEmail(user.email, raw);
        await writeAudit(req, "verify_email_resent", { userId: user.id, email: user.email });
    }

    res.json({
        message:
            "Si la cuenta existe y aún no está confirmada, enviamos un nuevo enlace de verificación.",
    });
};

export const forgotPassword = async (req: Request, res: Response) => {
    const email = String((req.body as { email?: string }).email || "")
        .trim()
        .toLowerCase();
    const user = await User.findOne({ where: { email } });

    if (user) {
        const raw = await issueToken(user.id, "password_reset", 1);
        await sendPasswordResetEmail(user.email, raw);
        await writeAudit(req, "password_reset_requested", {
            userId: user.id,
            email: user.email,
        });
    } else {
        await writeAudit(req, "password_reset_requested", {
            email,
            details: "Correo no registrado",
        });
    }

    res.json({ message: GENERIC_RESET_MSG });
};

export const resetPassword = async (req: Request, res: Response) => {
    const { token: rawToken, password } = req.body as {
        token?: string;
        password?: string;
    };
    const token = await consumeToken(String(rawToken || "").trim(), "password_reset");
    if (!token) {
        await writeAudit(req, "password_reset_failed", { details: "Token inválido o vencido" });
        return res.status(400).json({ message: "El enlace no es válido o ya caducó." });
    }

    if (!password || password.length < 8) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres." });
    }

    const user = await User.findByPk(token.userId);
    if (!user) {
        return res.status(400).json({ message: "El enlace no es válido o ya caducó." });
    }

    user.password = await hashPassword(password);
    await user.save();
    token.usedAt = new Date();
    await token.save();

    await AuthToken.update(
        { usedAt: new Date() },
        { where: { userId: user.id, type: "password_reset", usedAt: null } }
    );

    await clearLoginFailures([`user:${user.email}`, `ip:${getClientIp(req)}`]);
    await writeAudit(req, "password_reset_completed", {
        userId: user.id,
        email: user.email,
    });

    res.json({ message: "Contraseña actualizada. Ya puedes iniciar sesión." });
};
