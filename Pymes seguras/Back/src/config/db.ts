import colors from "colors";
import { DataTypes, Sequelize } from "sequelize";
import User, { initUserModel } from "../models/User";
import Course, { initCourseModel } from "../models/Course";
import CourseVideo, { initCourseVideoModel } from "../models/CourseVideo";
import CourseFile, { initCourseFileModel } from "../models/CourseFile";
import Diagnostic, { initDiagnosticModel } from "../models/Diagnostic";
import AuthToken, { initAuthTokenModel } from "../models/AuthToken";
import AuditLog, { initAuditLogModel } from "../models/AuditLog";
import { initLoginGuardModel } from "../models/LoginGuard";
import CommunityTopic, { initCommunityTopicModel } from "../models/CommunityTopic";
import CommunityComment, { initCommunityCommentModel } from "../models/CommunityComment";
import CommunityReport, { initCommunityReportModel } from "../models/CommunityReport";
import PlanProgress, { initPlanProgressModel } from "../models/PlanProgress";

export let sequelize: Sequelize;

const seedCoursesIfEmpty = async () => {
    const n = await Course.count();
    if (n > 0) return;
    await Course.bulkCreate(
        [
            {
                title: "Introducción a la Ciberseguridad",
                description:
                    "Aprende los conceptos básicos para proteger sistemas.",
                sortOrder: 0,
            },
            {
                title: "Hacking Ético",
                description: "Conoce cómo detectar vulnerabilidades.",
                sortOrder: 1,
            },
            {
                title: "Ataques más comunes",
                description: "Conoce los principales ataques a las empresas.",
                sortOrder: 2,
            },
        ],
        { validate: true }
    );
    console.log(colors.green("Cursos iniciales creados (sin videos ni PDFs)."));
};

const ensureUserSecurityColumns = async () => {
    const qi = sequelize.getQueryInterface();
    const columns = await qi.describeTable("users");
    if (!columns.role) {
        await qi.addColumn("users", "role", {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "user",
        });
    }
    if (!columns.email_verified && !columns.emailVerified) {
        await qi.addColumn("users", "email_verified", {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        });
    }
    if (!columns.privacy_accepted_at) {
        await qi.addColumn("users", "privacy_accepted_at", {
            type: DataTypes.DATE,
            allowNull: true,
        });
    }
    if (!columns.terms_accepted_at) {
        await qi.addColumn("users", "terms_accepted_at", {
            type: DataTypes.DATE,
            allowNull: true,
        });
    }
    if (!columns.policies_version) {
        await qi.addColumn("users", "policies_version", {
            type: DataTypes.STRING(20),
            allowNull: true,
        });
    }
};

const ensureDiagnosticCompanyColumns = async () => {
    const qi = sequelize.getQueryInterface();
    const columns = await qi.describeTable("diagnostics");
    if (!columns.sector) {
        await qi.addColumn("diagnostics", "sector", {
            type: DataTypes.STRING(40),
            allowNull: true,
        });
    }
    if (!columns.company_size) {
        await qi.addColumn("diagnostics", "company_size", {
            type: DataTypes.STRING(20),
            allowNull: true,
        });
    }
};

const connectBD = async () => {
    try {
        sequelize = new Sequelize(
            process.env.URL_BD!,
            process.env.USUARIO_BD!,
            process.env.PASSWORD_BD!,
            {
                host: "localhost",
                dialect: "mysql",
                port: 3306,
            }
        );
        await sequelize.authenticate();
        console.log(colors.cyan.bold("Conexión a la base de datos exitosa"));

        initUserModel(sequelize);
        initCourseModel(sequelize);
        initCourseVideoModel(sequelize);
        initCourseFileModel(sequelize);
        initDiagnosticModel(sequelize);
        initAuthTokenModel(sequelize);
        initAuditLogModel(sequelize);
        initLoginGuardModel(sequelize);
        initCommunityTopicModel(sequelize);
        initCommunityCommentModel(sequelize);
        initCommunityReportModel(sequelize);
        initPlanProgressModel(sequelize);

        User.hasMany(Diagnostic, {
            foreignKey: "userId",
            as: "diagnostics",
            onDelete: "CASCADE",
        });
        Diagnostic.belongsTo(User, { foreignKey: "userId" });
        Diagnostic.hasMany(PlanProgress, {
            foreignKey: "diagnosticId",
            as: "planProgress",
            onDelete: "CASCADE",
        });
        PlanProgress.belongsTo(Diagnostic, { foreignKey: "diagnosticId" });
        User.hasMany(PlanProgress, {
            foreignKey: "userId",
            as: "planProgress",
            onDelete: "CASCADE",
        });
        PlanProgress.belongsTo(User, { foreignKey: "userId" });
        User.hasMany(AuthToken, {
            foreignKey: "userId",
            as: "authTokens",
            onDelete: "CASCADE",
        });
        AuthToken.belongsTo(User, { foreignKey: "userId" });
        User.hasMany(AuditLog, {
            foreignKey: "userId",
            as: "auditLogs",
            onDelete: "SET NULL",
        });
        AuditLog.belongsTo(User, { foreignKey: "userId" });

        User.hasMany(CommunityTopic, {
            foreignKey: "userId",
            as: "communityTopics",
            onDelete: "SET NULL",
        });
        CommunityTopic.belongsTo(User, { foreignKey: "userId", as: "author" });
        User.hasMany(CommunityComment, {
            foreignKey: "userId",
            as: "communityComments",
            onDelete: "SET NULL",
        });
        CommunityComment.belongsTo(User, { foreignKey: "userId", as: "author" });
        CommunityTopic.hasMany(CommunityComment, {
            foreignKey: "topicId",
            as: "comments",
            onDelete: "CASCADE",
        });
        CommunityComment.belongsTo(CommunityTopic, { foreignKey: "topicId", as: "topic" });
        CommunityComment.hasMany(CommunityComment, {
            foreignKey: "parentCommentId",
            as: "replies",
            onDelete: "CASCADE",
        });
        CommunityComment.belongsTo(CommunityComment, {
            foreignKey: "parentCommentId",
            as: "parent",
        });
        User.hasMany(CommunityReport, {
            foreignKey: "reporterId",
            as: "communityReports",
            onDelete: "SET NULL",
        });
        CommunityReport.belongsTo(User, { foreignKey: "reporterId", as: "reporter" });

        Course.hasMany(CourseVideo, {
            foreignKey: "courseId",
            as: "videos",
            onDelete: "CASCADE",
        });
        CourseVideo.belongsTo(Course, { foreignKey: "courseId" });
        Course.hasMany(CourseFile, {
            foreignKey: "courseId",
            as: "files",
            onDelete: "CASCADE",
        });
        CourseFile.belongsTo(Course, { foreignKey: "courseId" });

        await sequelize.sync();
        await ensureUserSecurityColumns();
        await ensureDiagnosticCompanyColumns();
        await seedCoursesIfEmpty();
    } catch (error) {
        console.error(
            colors.bgRed.white.bold("Error al conectar a la base de datos:"),
            error
        );
        process.exit(1);
    }
};

export default connectBD;
