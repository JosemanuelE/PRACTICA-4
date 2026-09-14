import nodemailer from "nodemailer";
import colors from "colors";

const frontendUrl = () =>
    (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

const smtpReady = () =>
    Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransport = () => {
    if (!smtpReady()) return null;
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const sendOrLog = async (to: string, subject: string, html: string, text: string) => {
    const transport = getTransport();
    if (!transport) {
        console.log(colors.yellow.bold("\n[CORREO EN MODO DESARROLLO — SMTP no configurado]"));
        console.log(colors.yellow(`Para: ${to}`));
        console.log(colors.yellow(`Asunto: ${subject}`));
        console.log(colors.cyan(text));
        console.log("");
        return { logged: true as const };
    }

    await transport.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
        text,
    });
    return { logged: false as const };
};

export const sendVerificationEmail = async (to: string, rawToken: string) => {
    const url = `${frontendUrl()}/auth/verify-email?token=${rawToken}`;
    const text = `Confirma tu cuenta en Pymes Seguras:\n${url}\n\nEl enlace caduca en 24 horas.`;
    const html = `
      <p>Hola,</p>
      <p>Para activar tu cuenta en <strong>Pymes Seguras</strong> abre este enlace:</p>
      <p><a href="${url}">${url}</a></p>
      <p>Caduca en 24 horas. Si no creaste esta cuenta, ignora el mensaje.</p>
    `;
    const result = await sendOrLog(to, "Confirma tu correo — Pymes Seguras", html, text);
    return { ...result, url };
};

export const sendPasswordResetEmail = async (to: string, rawToken: string) => {
    const url = `${frontendUrl()}/auth/reset-password?token=${rawToken}`;
    const text = `Restablece tu contraseña:\n${url}\n\nEl enlace caduca en 1 hora.`;
    const html = `
      <p>Hola,</p>
      <p>Recibimos una solicitud para restablecer tu contraseña. Si fuiste tú, abre este enlace:</p>
      <p><a href="${url}">${url}</a></p>
      <p>Caduca en 1 hora. Si no lo pediste, ignora el mensaje.</p>
    `;
    const result = await sendOrLog(to, "Restablecer contraseña — Pymes Seguras", html, text);
    return { ...result, url };
};
