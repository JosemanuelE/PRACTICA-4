import { DataTypes, Model, Sequelize } from "sequelize";

export type CommunityReportTarget = "topic" | "comment";
export type CommunityReportStatus = "open" | "resolved" | "dismissed";

interface ICommunityReport {
    id?: number;
    reporterId: number | null;
    targetType: CommunityReportTarget;
    targetId: number;
    reason: string;
    details: string | null;
    status?: CommunityReportStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

class CommunityReport extends Model<ICommunityReport> implements ICommunityReport {
    declare id: number;
    declare reporterId: number | null;
    declare targetType: CommunityReportTarget;
    declare targetId: number;
    declare reason: string;
    declare details: string | null;
    declare status: CommunityReportStatus;
    declare createdAt: Date;
    declare updatedAt: Date;
}

export const initCommunityReportModel = (sequelize: Sequelize) => {
    CommunityReport.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            reporterId: { type: DataTypes.INTEGER, allowNull: true },
            targetType: { type: DataTypes.STRING(20), allowNull: false },
            targetId: { type: DataTypes.INTEGER, allowNull: false },
            reason: { type: DataTypes.STRING(40), allowNull: false },
            details: { type: DataTypes.STRING(1000), allowNull: true },
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: "open",
            },
        },
        {
            sequelize,
            tableName: "community_reports",
            underscored: true,
            timestamps: true,
            indexes: [
                { fields: ["status", "created_at"] },
                { fields: ["target_type", "target_id"] },
            ],
        }
    );
    return CommunityReport;
};

export default CommunityReport;