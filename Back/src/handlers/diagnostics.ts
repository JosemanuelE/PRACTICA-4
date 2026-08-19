import type { Request, Response } from "express";
import Diagnostic from "../models/Diagnostic";
import type { AuthedRequest } from "../middleware/userAuth";
import type { DiagnosticAnswer } from "../models/Diagnostic";

const isAnswer = (value: unknown): value is DiagnosticAnswer =>
    value === "si" || value === "no" || value === "parcial";

export const createDiagnostic = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthedRequest).userId;
        const { companyName, answers, securityScore, riskScore, weakestPoint } = req.body as {
            companyName?: string;
            answers?: Record<string, unknown>;
            securityScore?: number;
            riskScore?: number;
            weakestPoint?: string;
        };

        if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
            return res.status(400).json({ message: "Las respuestas son obligatorias" });
        }

        const cleanAnswers: Record<string, DiagnosticAnswer> = {};
        for (const [key, value] of Object.entries(answers)) {
            if (!isAnswer(value)) {
                return res.status(400).json({ message: `Respuesta inválida en "${key}"` });
            }
            cleanAnswers[key] = value;
        }

        if (Object.keys(cleanAnswers).length === 0) {
            return res.status(400).json({ message: "Debes enviar las respuestas del diagnóstico" });
        }

        const security = Number(securityScore);
        const risk = Number(riskScore);
        if (
            !Number.isFinite(security) ||
            !Number.isFinite(risk) ||
            security < 0 ||
            security > 100 ||
            risk < 0 ||
            risk > 100
        ) {
            return res.status(400).json({ message: "Los puntajes deben estar entre 0 y 100" });
        }

        const weakest = typeof weakestPoint === "string" ? weakestPoint.trim() : "";
        if (!weakest) {
            return res.status(400).json({ message: "El punto más débil es obligatorio" });
        }

        const diagnostic = await Diagnostic.create({
            userId,
            companyName: companyName?.trim() || null,
            answers: cleanAnswers,
            securityScore: Math.round(security),
            riskScore: Math.round(risk),
            weakestPoint: weakest.slice(0, 150),
        });

        res.status(201).json({
            message: "Diagnóstico guardado",
            diagnostic,
        });
    } catch (error) {
        res.status(500).json({ message: "Error al guardar el diagnóstico", error });
    }
};

export const listMyDiagnostics = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthedRequest).userId;
        const diagnostics = await Diagnostic.findAll({
            where: { userId },
            order: [["createdAt", "ASC"]],
        });
        res.json({ diagnostics });
    } catch (error) {
        res.status(500).json({ message: "Error al consultar los diagnósticos", error });
    }
};
