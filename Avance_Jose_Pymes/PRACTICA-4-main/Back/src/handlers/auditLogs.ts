import type { Request, Response } from "express";
import AuditLog from "../models/AuditLog";

export const listAuditLogs = async (_req: Request, res: Response) => {
    const logs = await AuditLog.findAll({
        order: [["createdAt", "DESC"]],
        limit: 80,
    });
    res.json({ logs });
};
