import { DataTypes, Model, Sequelize } from "sequelize";

export const COMMUNITY_CATEGORIES = [
    "phishing",
    "backups",
    "ransomware",
    "access-control",
    "data-protection",
    "incident-response",
] as const;

export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];
export type CommunityContentStatus = "visible" | "hidden" | "removed";

interface ICommunityTopic {
    id?: number;
    userId: number | null;
    category: CommunityCategory;
    title: string;
    content: string;
    status?: CommunityContentStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

class CommunityTopic extends Model<ICommunityTopic> implements ICommunityTopic {
    declare id: number;
    declare userId: number | null;
    declare category: CommunityCategory;
    declare title: string;
    declare content: string;
    declare status: CommunityContentStatus;
    declare createdAt: Date;
    declare updatedAt: Date;
}

export const initCommunityTopicModel = (sequelize: Sequelize) => {
    CommunityTopic.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: { type: DataTypes.INTEGER, allowNull: true },
            category: { type: DataTypes.STRING(40), allowNull: false },
            title: { type: DataTypes.STRING(160), allowNull: false },
            content: { type: DataTypes.TEXT, allowNull: false },
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: "visible",
            },
        },
        {
            sequelize,
            tableName: "community_topics",
            underscored: true,
            timestamps: true,
            indexes: [
                { fields: ["status", "category", "created_at"] },
                { fields: ["user_id", "created_at"] },
            ],
        }
    );
    return CommunityTopic;
};

export default CommunityTopic;