import type { Request, Response } from "express";
import Diagnostic from "../models/Diagnostic";
import PlanProgress from "../models/PlanProgress";
import type { AuthedRequest } from "../middleware/userAuth";

const trivial = /^(listo|ya|ya esta|ya está|ok|okay|hecho|si|sí|listo ya|ya lo hice|done)\.?$/i;
const taskIdPattern = /^([A-Za-z0-9]+)-(si|parcial|no)-1$/;

const validarPrueba = (texto: string) => {
    const limpio = texto.trim().replace(/\s+/g, " ");
    if (limpio.length < 20) return "Cuéntalo en una frase de al menos 20 caracteres.";
    if (trivial.test(limpio)) return "Escribe qué cambiaste y dónde quedó, no solo «listo».";
    if (/\d{5,}/.test(limpio)) return "No pegues códigos ni contraseñas. Di solo el lugar donde los guardaste.";
    if (limpio.length > 400) return "Basta con una frase. No pegues textos largos ni capturas.";
    return null;
};

const diagnosticDelUsuario = async (req: Request, diagnosticId: number) => {
    const userId = (req as AuthedRequest).userId;
    return Diagnostic.findOne({ where: { id: diagnosticId, userId } });
};

export const listPlanProgress = async (req: Request, res: Response) => {
    const diagnosticId = Number(req.params.id);
    if (!Number.isInteger(diagnosticId) || diagnosticId <= 0) {
        return res.status(400).json({ message: "El diagnóstico no es válido" });
    }
    const diagnostic = await diagnosticDelUsuario(req, diagnosticId);
    if (!diagnostic) return res.status(404).json({ message: "No encontramos ese diagnóstico" });

    const rows = await PlanProgress.findAll({
        where: { diagnosticId },
        attributes: ["taskId", "proof", "createdAt"],
        order: [["createdAt", "ASC"]],
    });
    res.json({
        progress: rows.map((row) => ({
            taskId: row.taskId,
            proof: row.proof,
            completedAt: row.createdAt,
        })),
    });
};

export const savePlanProgress = async (req: Request, res: Response) => {
    const diagnosticId = Number(req.params.id);
    if (!Number.isInteger(diagnosticId) || diagnosticId <= 0) {
        return res.status(400).json({ message: "El diagnóstico no es válido" });
    }
    const diagnostic = await diagnosticDelUsuario(req, diagnosticId);
    if (!diagnostic) return res.status(404).json({ message: "No encontramos ese diagnóstico" });

    const taskId = typeof req.body?.taskId === "string" ? req.body.taskId.trim() : "";
    const proof = typeof req.body?.proof === "string" ? req.body.proof : "";
    const match = taskIdPattern.exec(taskId);
    if (!match) return res.status(400).json({ message: "Esa tarea no se puede cerrar así" });

    const questionId = match[1];
    const answers = diagnostic.answers || {};
    if (answers[questionId] !== match[2]) {
        return res.status(400).json({ message: "Esa tarea no corresponde a tu diagnóstico" });
    }

    const error = validarPrueba(proof);
    if (error) return res.status(400).json({ message: error });

    const limpio = proof.trim().replace(/\s+/g, " ");
    const userId = (req as AuthedRequest).userId;
    const [row] = await PlanProgress.findOrCreate({
        where: { diagnosticId, taskId },
        defaults: { userId, diagnosticId, taskId, proof: limpio },
    });
    if (row.proof !== limpio) await row.update({ proof: limpio });

    res.status(201).json({
        message: "Quedó registrada la tarea de esta semana",
        progress: { taskId: row.taskId, proof: row.proof, completedAt: row.createdAt },
    });
};
