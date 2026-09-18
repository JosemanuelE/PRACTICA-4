import { randomBytes } from "crypto";
import fs from "fs";
import multer from "multer";
import path from "path";

export const UPLOAD_COURSE_FILES_DIR = path.join(
    process.cwd(),
    "uploads",
    "course-files"
);

if (!fs.existsSync(UPLOAD_COURSE_FILES_DIR)) {
    fs.mkdirSync(UPLOAD_COURSE_FILES_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_COURSE_FILES_DIR);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || ".bin";
        const token = randomBytes(8).toString("hex");
        cb(null, `${Date.now()}-${token}${ext}`);
    },
});

const allowedMime = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const uploadCourseFile = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (allowedMime.has(file.mimetype)) {
            cb(null, true);
            return;
        }
        cb(new Error("Solo se permiten archivos PDF o Word (.doc, .docx)"));
    },
});
