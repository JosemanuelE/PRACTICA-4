import type { NextFunction, Request, Response } from "express";
import { getClientIp } from "../Utils/clientInfo";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQ = 40;
const buckets = new Map<string, { count: number; resetAt: number }>();

export const rateLimitAuth = (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const now = Date.now();
    const current = buckets.get(ip);

    if (!current || now > current.resetAt) {
        buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return next();
    }

    current.count += 1;
    if (current.count > MAX_REQ) {
        return res.status(429).json({
            message: "Hay demasiadas solicitudes desde esta conexión. Espera unos minutos e inténtalo de nuevo.",
        });
    }
    next();
};
