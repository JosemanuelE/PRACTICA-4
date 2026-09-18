import type { Request } from "express";

export const getClientIp = (req: Request) => {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.trim()) {
        return forwarded.split(",")[0].trim();
    }
    return req.socket.remoteAddress || "unknown";
};

export const getUserAgent = (req: Request) => {
    const ua = req.headers["user-agent"];
    if (!ua) return null;
    return ua.slice(0, 255);
};
