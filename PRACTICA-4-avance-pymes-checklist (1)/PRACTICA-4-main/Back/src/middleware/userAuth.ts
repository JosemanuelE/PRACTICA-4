import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const getSecret = () => process.env.JWT_SECRET || "dev-cambiar-en-produccion";

export type AuthedRequest = Request & { userId: number; userRole: "user" | "admin" };

export const requireUser = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No autorizado — inicia sesión primero" });
    }
    const token = header.slice(7);
    try {
        const payload = jwt.verify(token, getSecret()) as { id?: number; role?: string };
        if (payload.role !== "user" && payload.role !== "admin") {
            return res.status(403).json({ message: "Acceso denegado" });
        }
        if (!payload.id) {
            return res.status(401).json({ message: "Sesión inválida o expirada" });
        }
        (req as AuthedRequest).userId = payload.id;
        (req as AuthedRequest).userRole = payload.role;
        next();
    } catch {
        return res.status(401).json({ message: "Sesión inválida o expirada" });
    }
};
