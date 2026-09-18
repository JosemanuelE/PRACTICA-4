import crypto from "crypto";

export const createRawToken = () => crypto.randomBytes(32).toString("hex");

export const hashToken = (raw: string) =>
    crypto.createHash("sha256").update(raw).digest("hex");
