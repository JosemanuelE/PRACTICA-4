import type { Request } from "express";
import AuditLog from "../models/AuditLog";
import { getClientIp, getUserAgent } from "./clientInfo";

export const writeAudit = async (
    req: Request,
    action: string,
    opts?: { userId?: number | null; email?: string | null; details?: string | null }
) => {
    try {
        await AuditLog.create({
            userId: opts?.userId ?? null,
            email: opts?.email ? opts.email.slice(0, 150) : null,
            action,
            ip: getClientIp(req),
            userAgent: getUserAgent(req),
            details: opts?.details ? opts.details.slice(0, 255) : null,
        });
    } catch (error) {
        console.error("No se pudo escribir la auditoría:", error);
    }
};
