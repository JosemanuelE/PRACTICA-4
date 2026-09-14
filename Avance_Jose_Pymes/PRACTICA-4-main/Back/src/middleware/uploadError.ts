import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { uploadCourseFile } from "../config/upload";

/** Captura errores de multer (tipo de archivo, tamaño, etc.) */
export const handleCourseFileUpload = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    uploadCourseFile.single("file")(req, res, (err: unknown) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    message: "El archivo supera el tamaño máximo (15 MB)",
                });
            }
            return res.status(400).json({ message: err.message });
        }
        if (err instanceof Error) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};
