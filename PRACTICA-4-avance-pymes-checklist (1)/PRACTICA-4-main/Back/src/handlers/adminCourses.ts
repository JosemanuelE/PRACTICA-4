import type { Request, Response } from "express";
import type { Order } from "sequelize";
import Course from "../models/Course";
import CourseVideo from "../models/CourseVideo";
import CourseFile from "../models/CourseFile";
import path from "path";
import fs from "fs/promises";
import { removeUploadedCourseFile } from "../Utils/courseFileStorage";
import { UPLOAD_COURSE_FILES_DIR } from "../config/upload";

const childOrder: Order = [
    ["sortOrder", "ASC"],
    ["id", "ASC"],
];

const courseInclude = [
    {
        model: CourseVideo,
        as: "videos",
        separate: true,
        order: childOrder,
    },
    {
        model: CourseFile,
        as: "files",
        separate: true,
        order: childOrder,
    },
];

export const adminListCourses = async (_req: Request, res: Response) => {
    try {
        const courses = await Course.findAll({
            include: courseInclude,
            order: [["sortOrder", "ASC"], ["id", "ASC"]],
        });
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al listar cursos" });
    }
};

export const adminCreateCourse = async (req: Request, res: Response) => {
    try {
        const { title, description, sortOrder } = req.body as {
            title?: string;
            description?: string | null;
            sortOrder?: number;
        };
        if (!title?.trim()) {
            return res.status(400).json({ message: "El título es obligatorio" });
        }
        const maxSort =
            (await Course.max("sortOrder", { raw: true })) ?? -1;
        const nextOrder =
            typeof sortOrder === "number" ? sortOrder : Number(maxSort) + 1;
        const course = await Course.create({
            title: title.trim(),
            description: description?.trim() || null,
            sortOrder: nextOrder,
        });
        const full = await Course.findByPk(course.id, { include: courseInclude });
        res.status(201).json(full);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear el curso" });
    }
};

export const adminUpdateCourse = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }
        const { title, description, sortOrder } = req.body as {
            title?: string;
            description?: string | null;
            sortOrder?: number;
        };
        if (title !== undefined) course.title = title.trim();
        if (description !== undefined) {
            course.description = description === null ? null : String(description).trim() || null;
        }
        if (typeof sortOrder === "number") course.sortOrder = sortOrder;
        await course.save();
        const full = await Course.findByPk(id, { include: courseInclude });
        res.json(full);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar el curso" });
    }
};

export const adminDeleteCourse = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }
        await course.destroy();
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar el curso" });
    }
};

export const adminAddVideo = async (req: Request, res: Response) => {
    try {
        const courseId = Number(req.params.id);
        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }
        const { url, title } = req.body as { url?: string; title?: string | null };
        if (!url?.trim()) {
            return res.status(400).json({ message: "La URL del video es obligatoria" });
        }
        const maxV =
            (await CourseVideo.max("sortOrder", {
                where: { courseId },
                raw: true,
            })) ?? -1;
        const video = await CourseVideo.create({
            courseId,
            url: url.trim(),
            title: title?.trim() || null,
            sortOrder: Number(maxV) + 1,
        });
        res.status(201).json(video);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al añadir el video" });
    }
};

export const adminDeleteVideo = async (req: Request, res: Response) => {
    try {
        const courseId = Number(req.params.id);
        const videoId = Number(req.params.videoId);
        const video = await CourseVideo.findOne({
            where: { id: videoId, courseId },
        });
        if (!video) {
            return res.status(404).json({ message: "Video no encontrado" });
        }
        await video.destroy();
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar el video" });
    }
};

export const adminAddFile = async (req: Request, res: Response) => {
    try {
        const courseId = Number(req.params.id);
        const course = await Course.findByPk(courseId);
        const uploaded = req.file;
        if (!course) {
            if (uploaded) {
                await fs.unlink(path.join(UPLOAD_COURSE_FILES_DIR, uploaded.filename)).catch(
                    () => {}
                );
            }
            return res.status(404).json({ message: "Curso no encontrado" });
        }
        if (!uploaded) {
            return res.status(400).json({ message: "Debes seleccionar un archivo" });
        }
        const body = req.body as { displayName?: string; name?: string };
        const displayName = (
            body.displayName ||
            body.name ||
            uploaded.originalname
        ).trim();
        const publicPath = `/uploads/course-files/${uploaded.filename}`;
        const maxF =
            (await CourseFile.max("sortOrder", {
                where: { courseId },
                raw: true,
            })) ?? -1;
        const file = await CourseFile.create({
            courseId,
            name: displayName || uploaded.originalname,
            url: publicPath,
            sortOrder: Number(maxF) + 1,
        });
        res.status(201).json(file);
    } catch (error) {
        const f = req.file;
        if (f) {
            await fs.unlink(path.join(UPLOAD_COURSE_FILES_DIR, f.filename)).catch(() => {});
        }
        console.error(error);
        res.status(500).json({ message: "Error al añadir el archivo" });
    }
};

export const adminDeleteFile = async (req: Request, res: Response) => {
    try {
        const courseId = Number(req.params.id);
        const fileId = Number(req.params.fileId);
        const file = await CourseFile.findOne({
            where: { id: fileId, courseId },
        });
        if (!file) {
            return res.status(404).json({ message: "Archivo no encontrado" });
        }
        await removeUploadedCourseFile(file.url);
        await file.destroy();
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar el archivo" });
    }
};
