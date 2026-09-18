import type { Request, Response } from "express";
import Course from "../models/Course";
import CourseVideo from "../models/CourseVideo";
import CourseFile from "../models/CourseFile";

export const getCoursesPublic = async (_req: Request, res: Response) => {
    try {
        const courses = await Course.findAll({
            include: [
                {
                    model: CourseVideo,
                    as: "videos",
                    separate: true,
                    order: [["sortOrder", "ASC"], ["id", "ASC"]],
                },
                {
                    model: CourseFile,
                    as: "files",
                    separate: true,
                    order: [["sortOrder", "ASC"], ["id", "ASC"]],
                },
            ],
            order: [["sortOrder", "ASC"], ["id", "ASC"]],
        });
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los cursos" });
    }
};
