import { Router } from "express";
import { body } from "express-validator";
import * as userAuthHandlers from "./handlers";
import { handleInputErrors } from "./middleware/validation";
import * as adminAuthHandlers from "./handlers/adminAuth";
import { requireAdmin } from "./middleware/adminAuth";
import { requireUser } from "./middleware/userAuth";
import { getCoursesPublic } from "./handlers/coursesPublic";
import * as adminCourses from "./handlers/adminCourses";
import { handleCourseFileUpload } from "./middleware/uploadError";
import { createDiagnostic, listMyDiagnostics } from "./handlers/diagnostics";
import { rateLimitAuth } from "./middleware/rateLimitAuth";
import {
    forgotPassword,
    resendVerification,
    resetPassword,
    verifyEmail,
} from "./handlers/accountSecurity";
import { listAuditLogs } from "./handlers/auditLogs";

const router = Router();

// ─── AUTH ───────────────────────────────────────────────────────────────────
router.post(
    "/auth/register",
    rateLimitAuth,
    body("name").notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("El email no es válido"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("La contraseña debe tener al menos 8 caracteres"),
    handleInputErrors,
    userAuthHandlers.createUser
);

router.post(
    "/auth/login",
    rateLimitAuth,
    body("email").isEmail().withMessage("El email no es válido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
    handleInputErrors,
    userAuthHandlers.loginUser
);

// Datos de la sesión activa — sirve para confirmar que el usuario está autenticado
router.get("/auth/me", requireUser, userAuthHandlers.getMe);

router.post(
    "/auth/verify-email",
    rateLimitAuth,
    body("token").notEmpty().withMessage("El token es obligatorio"),
    handleInputErrors,
    verifyEmail
);
router.post(
    "/auth/resend-verification",
    rateLimitAuth,
    body("email").isEmail().withMessage("El email no es válido"),
    handleInputErrors,
    resendVerification
);
router.post(
    "/auth/forgot-password",
    rateLimitAuth,
    body("email").isEmail().withMessage("El email no es válido"),
    handleInputErrors,
    forgotPassword
);
router.post(
    "/auth/reset-password",
    rateLimitAuth,
    body("token").notEmpty().withMessage("El token es obligatorio"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("La contraseña debe tener al menos 8 caracteres"),
    handleInputErrors,
    resetPassword
);

// ─── CURSOS: ruta pública (listado sin detalles) ─────────────────────────────
router.get("/api/courses", getCoursesPublic);

// ─── CURSOS: ruta protegida — requiere JWT de usuario logueado ───────────────
router.get("/api/courses/private", requireUser, getCoursesPublic);

// ─── DIAGNÓSTICOS: guardar y consultar historial del usuario ────────────────
router.post("/api/diagnostics", requireUser, createDiagnostic);
router.get("/api/diagnostics", requireUser, listMyDiagnostics);

// ─── ADMIN AUTH ──────────────────────────────────────────────────────────────
router.post(
    "/admin/auth/login",
    rateLimitAuth,
    body("email").isEmail().withMessage("El email no es válido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
    handleInputErrors,
    adminAuthHandlers.adminLogin
);

// ─── ADMIN PANEL ─────────────────────────────────────────────────────────────
const adminRouter = Router();
adminRouter.use(requireAdmin);
adminRouter.get("/audit-logs", listAuditLogs);
adminRouter.get("/courses", adminCourses.adminListCourses);
adminRouter.post(
    "/courses",
    body("title").notEmpty().withMessage("El título es obligatorio"),
    handleInputErrors,
    adminCourses.adminCreateCourse
);
adminRouter.put("/courses/:id", adminCourses.adminUpdateCourse);
adminRouter.delete("/courses/:id", adminCourses.adminDeleteCourse);
adminRouter.post(
    "/courses/:id/videos",
    body("url").notEmpty().withMessage("La URL del video es obligatoria"),
    handleInputErrors,
    adminCourses.adminAddVideo
);
adminRouter.delete("/courses/:id/videos/:videoId", adminCourses.adminDeleteVideo);
adminRouter.post("/courses/:id/files", handleCourseFileUpload, adminCourses.adminAddFile);
adminRouter.delete("/courses/:id/files/:fileId", adminCourses.adminDeleteFile);

router.use("/admin", adminRouter);

export default router;
