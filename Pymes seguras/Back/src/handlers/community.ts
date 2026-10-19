import { Op } from "sequelize";
import type { Request, Response } from "express";
import CommunityComment from "../models/CommunityComment";
import CommunityReport from "../models/CommunityReport";
import CommunityTopic, { COMMUNITY_CATEGORIES } from "../models/CommunityTopic";
import User from "../models/User";
import type { AuthedRequest } from "../middleware/userAuth";

const REPORT_REASONS = ["spam", "off-topic", "abuse", "sensitive-data", "other"];
const PUBLIC_AUTHOR = { model: User, as: "author", attributes: ["id", "name"] };

const currentUserId = (req: Request) => (req as AuthedRequest).userId;
const parseId = (value: unknown) => {
    if (typeof value !== "string") return null;
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const validText = (value: unknown, maxLength: number) =>
    typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;

const publicCommentIncludes = [
    PUBLIC_AUTHOR,
    {
        model: CommunityComment,
        as: "replies",
        where: { status: "visible" },
        required: false,
        include: [PUBLIC_AUTHOR],
    },
];

export const listCommunityTopics = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 15));
        const category = typeof req.query.category === "string" ? req.query.category : "";
        const search = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 100) : "";
        if (category && !COMMUNITY_CATEGORIES.includes(category as (typeof COMMUNITY_CATEGORIES)[number])) {
            return res.status(400).json({ message: "La categoría no es válida" });
        }

        const where = {
            status: "visible",
            ...(category ? { category } : {}),
            ...(search
                ? {
                      [Op.or]: [
                          { title: { [Op.like]: `%${search}%` } },
                          { content: { [Op.like]: `%${search}%` } },
                      ],
                  }
                : {}),
        };
        const result = await CommunityTopic.findAndCountAll({
            where,
            include: [PUBLIC_AUTHOR],
            order: [["createdAt", "DESC"]],
            limit,
            offset: (page - 1) * limit,
            distinct: true,
        });
        res.json({ topics: result.rows, total: result.count, page, limit, categories: COMMUNITY_CATEGORIES });
    } catch {
        res.status(500).json({ message: "No se pudieron cargar los temas" });
    }
};

export const getCommunityTopic = async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "El tema no es válido" });
    try {
        const topic = await CommunityTopic.findOne({
            where: { id, status: "visible" },
            include: [
                PUBLIC_AUTHOR,
                {
                    model: CommunityComment,
                    as: "comments",
                    where: { status: "visible", parentCommentId: null },
                    required: false,
                    include: publicCommentIncludes,
                },
            ],
            order: [[{ model: CommunityComment, as: "comments" }, "createdAt", "ASC"]],
        });
        if (!topic) return res.status(404).json({ message: "No se encontró el tema" });
        res.json({ topic });
    } catch {
        res.status(500).json({ message: "No se pudo cargar la conversación" });
    }
};

export const createCommunityTopic = async (req: Request, res: Response) => {
    const { category, title, content } = req.body as Record<string, unknown>;
    if (!COMMUNITY_CATEGORIES.includes(category as (typeof COMMUNITY_CATEGORIES)[number])) {
        return res.status(400).json({ message: "La categoría no es válida" });
    }
    if (!validText(title, 160)) return res.status(400).json({ message: "El título debe tener entre 1 y 160 caracteres" });
    if (!validText(content, 10000)) return res.status(400).json({ message: "El tema debe tener entre 1 y 10000 caracteres" });
    try {
        const topic = await CommunityTopic.create({
            userId: currentUserId(req),
            category: category as (typeof COMMUNITY_CATEGORIES)[number],
            title: (title as string).trim(),
            content: (content as string).trim(),
        });
        const saved = await CommunityTopic.findByPk(topic.id, { include: [PUBLIC_AUTHOR] });
        res.status(201).json({ topic: saved });
    } catch {
        res.status(500).json({ message: "No se pudo publicar el tema" });
    }
};

export const updateCommunityTopic = async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const { category, title, content } = req.body as Record<string, unknown>;
    if (!id) return res.status(400).json({ message: "El tema no es válido" });
    if (category !== undefined && !COMMUNITY_CATEGORIES.includes(category as (typeof COMMUNITY_CATEGORIES)[number])) {
        return res.status(400).json({ message: "La categoría no es válida" });
    }
    if (title !== undefined && !validText(title, 160)) return res.status(400).json({ message: "El título no es válido" });
    if (content !== undefined && !validText(content, 10000)) return res.status(400).json({ message: "El contenido no es válido" });
    if (title === undefined && content === undefined && category === undefined) {
        return res.status(400).json({ message: "No hay cambios para guardar" });
    }
    try {
        const topic = await CommunityTopic.findOne({ where: { id, userId: currentUserId(req), status: "visible" } });
        if (!topic) return res.status(404).json({ message: "No se encontró un tema editable" });
        await topic.update({
            ...(category !== undefined ? { category: category as (typeof COMMUNITY_CATEGORIES)[number] } : {}),
            ...(title !== undefined ? { title: (title as string).trim() } : {}),
            ...(content !== undefined ? { content: (content as string).trim() } : {}),
        });
        res.json({ topic });
    } catch {
        res.status(500).json({ message: "No se pudo actualizar el tema" });
    }
};

export const deleteCommunityTopic = async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "El tema no es válido" });
    try {
        const topic = await CommunityTopic.findOne({ where: { id, userId: currentUserId(req), status: "visible" } });
        if (!topic) return res.status(404).json({ message: "No se encontró un tema eliminable" });
        await topic.update({ status: "removed" });
        await CommunityComment.update({ status: "removed" }, { where: { topicId: id, status: "visible" } });
        res.json({ message: "Tema eliminado" });
    } catch {
        res.status(500).json({ message: "No se pudo eliminar el tema" });
    }
};

export const createCommunityComment = async (req: Request, res: Response) => {
    const topicId = parseId(req.params.id);
    const { content, parentCommentId } = req.body as Record<string, unknown>;
    if (!topicId) return res.status(400).json({ message: "El tema no es válido" });
    if (!validText(content, 5000)) return res.status(400).json({ message: "El comentario debe tener entre 1 y 5000 caracteres" });
    let parentId: number | null = null;
    if (parentCommentId !== undefined && parentCommentId !== null) {
        parentId = Number(parentCommentId);
        if (!Number.isInteger(parentId) || parentId < 1) return res.status(400).json({ message: "La respuesta no es válida" });
    }
    try {
        const topic = await CommunityTopic.findOne({ where: { id: topicId, status: "visible" } });
        if (!topic) return res.status(404).json({ message: "No se encontró el tema" });
        if (parentId !== null) {
            const parent = await CommunityComment.findOne({
                where: { id: parentId, topicId, parentCommentId: null, status: "visible" },
            });
            if (!parent) return res.status(400).json({ message: "Solo puedes responder al tema o a un comentario principal" });
        }
        const comment = await CommunityComment.create({
            topicId,
            userId: currentUserId(req),
            parentCommentId: parentId,
            content: (content as string).trim(),
        });
        const saved = await CommunityComment.findByPk(comment.id, { include: [PUBLIC_AUTHOR] });
        res.status(201).json({ comment: saved });
    } catch {
        res.status(500).json({ message: "No se pudo publicar el comentario" });
    }
};

export const updateCommunityComment = async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const { content } = req.body as Record<string, unknown>;
    if (!id) return res.status(400).json({ message: "El comentario no es válido" });
    if (!validText(content, 5000)) return res.status(400).json({ message: "El comentario debe tener entre 1 y 5000 caracteres" });
    try {
        const comment = await CommunityComment.findOne({ where: { id, userId: currentUserId(req), status: "visible" } });
        if (!comment) return res.status(404).json({ message: "No se encontró un comentario editable" });
        await comment.update({ content: (content as string).trim() });
        res.json({ comment });
    } catch {
        res.status(500).json({ message: "No se pudo actualizar el comentario" });
    }
};

export const deleteCommunityComment = async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "El comentario no es válido" });
    try {
        const comment = await CommunityComment.findOne({ where: { id, userId: currentUserId(req), status: "visible" } });
        if (!comment) return res.status(404).json({ message: "No se encontró un comentario eliminable" });
        await comment.update({ status: "removed" });
        await CommunityComment.update({ status: "removed" }, { where: { parentCommentId: id, status: "visible" } });
        res.json({ message: "Comentario eliminado" });
    } catch {
        res.status(500).json({ message: "No se pudo eliminar el comentario" });
    }
};

export const createCommunityReport = async (req: Request, res: Response) => {
    const { targetType, targetId, reason, details } = req.body as Record<string, unknown>;
    const id = Number(targetId);
    if (targetType !== "topic" && targetType !== "comment") return res.status(400).json({ message: "El tipo de contenido no es válido" });
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "El contenido reportado no es válido" });
    if (typeof reason !== "string" || !REPORT_REASONS.includes(reason)) return res.status(400).json({ message: "El motivo del reporte no es válido" });
    if (details !== undefined && details !== null && (typeof details !== "string" || details.length > 1000)) {
        return res.status(400).json({ message: "El detalle no puede superar 1000 caracteres" });
    }
    try {
        const target = targetType === "topic"
            ? await CommunityTopic.findOne({ where: { id, status: "visible" } })
            : await CommunityComment.findOne({ where: { id, status: "visible" } });
        if (!target) return res.status(404).json({ message: "No se encontró el contenido reportado" });
        const reporterId = currentUserId(req);
        const duplicate = await CommunityReport.findOne({
            where: { reporterId, targetType, targetId: id, status: "open" },
        });
        if (duplicate) return res.status(409).json({ message: "Ya reportaste este contenido" });
        await CommunityReport.create({
            reporterId,
            targetType,
            targetId: id,
            reason,
            details: typeof details === "string" ? details.trim() || null : null,
        });
        res.status(201).json({ message: "Reporte enviado para revisión" });
    } catch {
        res.status(500).json({ message: "No se pudo enviar el reporte" });
    }
};

export const listCommunityReports = async (_req: Request, res: Response) => {
    try {
        const reports = await CommunityReport.findAll({
            where: { status: "open" },
            include: [{ model: User, as: "reporter", attributes: ["id", "name"] }],
            order: [["createdAt", "ASC"]],
            limit: 100,
        });
        const enriched = await Promise.all(reports.map(async (report) => {
            const target = report.targetType === "topic"
                ? await CommunityTopic.findByPk(report.targetId, { attributes: ["id", "title", "content", "status"] })
                : await CommunityComment.findByPk(report.targetId, {
                      attributes: ["id", "content", "status", "topicId"],
                      include: [{ model: CommunityTopic, as: "topic", attributes: ["id", "title"] }],
                  });
            return { ...report.toJSON(), target };
        }));
        res.json({ reports: enriched });
    } catch {
        res.status(500).json({ message: "No se pudieron cargar los reportes" });
    }
};

export const updateCommunityReport = async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const { action } = req.body as { action?: unknown };
    if (!id) return res.status(400).json({ message: "El reporte no es válido" });
    if (action !== "hide" && action !== "dismiss") return res.status(400).json({ message: "La acción no es válida" });
    try {
        const report = await CommunityReport.findOne({ where: { id, status: "open" } });
        if (!report) return res.status(404).json({ message: "No se encontró un reporte pendiente" });
        if (action === "hide") {
            if (report.targetType === "topic") {
                const topic = await CommunityTopic.findByPk(report.targetId);
                if (topic && topic.status !== "removed") await topic.update({ status: "hidden" });
            } else {
                const comment = await CommunityComment.findByPk(report.targetId);
                if (comment && comment.status !== "removed") await comment.update({ status: "hidden" });
            }
            await report.update({ status: "resolved" });
        } else {
            await report.update({ status: "dismissed" });
        }
        res.json({ message: action === "hide" ? "Contenido ocultado" : "Reporte descartado" });
    } catch {
        res.status(500).json({ message: "No se pudo actualizar el reporte" });
    }
};

export const moderateCommunityContent = async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const { status } = req.body as { status?: unknown };
    if (!id) return res.status(400).json({ message: "El contenido no es válido" });
    if (status !== "visible" && status !== "hidden") return res.status(400).json({ message: "El estado no es válido" });
    try {
        if (req.params.type === "topics") {
            const topic = await CommunityTopic.findByPk(id);
            if (!topic || topic.status === "removed") return res.status(404).json({ message: "No se encontró el contenido" });
            await topic.update({ status });
        } else if (req.params.type === "comments") {
            const comment = await CommunityComment.findByPk(id);
            if (!comment || comment.status === "removed") return res.status(404).json({ message: "No se encontró el contenido" });
            await comment.update({ status });
        } else {
            return res.status(404).json({ message: "No se encontró el contenido" });
        }
        res.json({ message: status === "hidden" ? "Contenido ocultado" : "Contenido restaurado" });
    } catch {
        res.status(500).json({ message: "No se pudo moderar el contenido" });
    }
};

export const listHiddenCommunityContent = async (_req: Request, res: Response) => {
    try {
        const [topics, comments] = await Promise.all([
            CommunityTopic.findAll({
                where: { status: "hidden" },
                include: [PUBLIC_AUTHOR],
                order: [["updatedAt", "DESC"]],
                limit: 100,
            }),
            CommunityComment.findAll({
                where: { status: "hidden" },
                include: [
                    PUBLIC_AUTHOR,
                    { model: CommunityTopic, as: "topic", attributes: ["id", "title"] },
                ],
                order: [["updatedAt", "DESC"]],
                limit: 100,
            }),
        ]);
        res.json({ topics, comments });
    } catch {
        res.status(500).json({ message: "No se pudo cargar el contenido oculto" });
    }
};