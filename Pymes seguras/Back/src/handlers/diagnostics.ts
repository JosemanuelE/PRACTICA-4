import type { Request, Response } from "express";
import Diagnostic from "../models/Diagnostic";
import type { AuthedRequest } from "../middleware/userAuth";
import type { DiagnosticAnswer, Sector, Tamano } from "../models/Diagnostic";
import { SECTORES, TAMANOS } from "../models/Diagnostic";

const isAnswer = (value: unknown): value is DiagnosticAnswer =>
    value === "si" || value === "no" || value === "parcial";

const isSector = (value: unknown): value is Sector =>
    typeof value === "string" && (SECTORES as readonly string[]).includes(value);

const isTamano = (value: unknown): value is Tamano =>
    typeof value === "string" && (TAMANOS as readonly string[]).includes(value);

export const createDiagnostic = async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthedRequest).userId;
        const {
            companyName,
            sector,
            companySize,
            answers,
            securityScore,
            riskScore,
            weakestPoint,
        } = req.body as {
            companyName?: string;
            sector?: unknown;
            companySize?: unknown;
            answers?: Record<string, unknown>;
            securityScore?: number;
            riskScore?: number;
            weakestPoint?: string;
        };

        if (sector !== undefined && sector !== null && sector !== "" && !isSector(sector)) {
            return res.status(400).json({ message: "El sector de la empresa no es válido" });
        }
        if (
            companySize !== undefined &&
            companySize !== null &&
            companySize !== "" &&
            !isTamano(companySize)
        ) {
            return res.status(400).json({ message: "El tamaño de la empresa no es válido" });
        }

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
            sector: isSector(sector) ? sector : null,
            companySize: isTamano(companySize) ? companySize : null,
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

export const publicStats = async (_req: Request, res: Response) => {
    try {
    const rows = await Diagnostic.findAll({ attributes: ["answers", "securityScore"] });
    const total = rows.length;
    const share = (match: (answers: Diagnostic["answers"]) => boolean) =>
        total === 0 ? null : Math.round((100 * rows.filter((row) => match(row.answers || {})).length) / total);
    const average =
        total === 0
            ? null
            : Math.round(rows.reduce((sum, row) => sum + Number(row.securityScore || 0), 0) / total);

    res.json({
        diagnostics: total,
        promedioSeguridad: average,
        conVerificacion: share((answers) => answers.dobleFA === "si"),
        sinCopia: share((answers) => answers.backup === "no"),
        wifiCompartida: share((answers) => answers.wifi !== "si"),
        sinVerificacion: share((answers) => answers.dobleFA !== "si"),
        conPlanEscrito: share((answers) => answers.plan === "si"),
    });
    } catch {
        res.status(500).json({ message: "No se pudieron leer los diagnósticos" });
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
