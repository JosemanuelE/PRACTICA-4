import { DataTypes, Model, Sequelize } from "sequelize";

export interface IAuditLogAttrs {
    id?: number;
    userId?: number | null;
    email?: string | null;
    action: string;
    ip?: string | null;
    userAgent?: string | null;
    details?: string | null;
    createdAt?: Date;
}

class AuditLog extends Model<IAuditLogAttrs> implements IAuditLogAttrs {
    declare id: number;
    declare userId: number | null;
    declare email: string | null;
    declare action: string;
    declare ip: string | null;
    declare userAgent: string | null;
    declare details: string | null;
    declare createdAt: Date;
}

export const initAuditLogModel = (sequelize: Sequelize) => {
    AuditLog.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING(150),
                allowNull: true,
            },
            action: {
                type: DataTypes.STRING(60),
                allowNull: false,
            },
            ip: {
                type: DataTypes.STRING(80),
                allowNull: true,
            },
            userAgent: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            details: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: "audit_logs",
            underscored: true,
            timestamps: true,
            updatedAt: false,
        }
    );
    return AuditLog;
};

export default AuditLog;
