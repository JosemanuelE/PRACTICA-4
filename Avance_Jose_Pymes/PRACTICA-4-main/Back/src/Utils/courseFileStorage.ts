import fs from "fs/promises";
import path from "path";
import { UPLOAD_COURSE_FILES_DIR } from "../config/upload";

const PREFIX = "/uploads/course-files/";

/** Elimina del disco un archivo subido por el panel (solo rutas bajo course-files). */
export async function removeUploadedCourseFile(publicUrl: string): Promise<void> {
    if (!publicUrl.startsWith(PREFIX)) return;
    const base = path.basename(publicUrl);
    if (!base || base.includes("..")) return;
    const full = path.join(UPLOAD_COURSE_FILES_DIR, base);
    const resolved = path.resolve(full);
    const root = path.resolve(UPLOAD_COURSE_FILES_DIR);
    if (!resolved.startsWith(root)) return;
    await fs.unlink(resolved).catch(() => {});
}
