import { DataTypes, Model, Sequelize } from "sequelize";
import type { CommunityContentStatus } from "./CommunityTopic";

interface ICommunityComment {
    id?: number;
    topicId: number;
    userId: number | null;
    parentCommentId: number | null;
    content: string;
    status?: CommunityContentStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

class CommunityComment extends Model<ICommunityComment> implements ICommunityComment {
    declare id: number;
    declare topicId: number;
    declare userId: number | null;
    declare parentCommentId: number | null;
    declare content: string;
    declare status: CommunityContentStatus;
    declare createdAt: Date;
    declare updatedAt: Date;
}

export const initCommunityCommentModel = (sequelize: Sequelize) => {
    CommunityComment.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            topicId: { type: DataTypes.INTEGER, allowNull: false },
            userId: { type: DataTypes.INTEGER, allowNull: true },
            parentCommentId: { type: DataTypes.INTEGER, allowNull: true },
            content: { type: DataTypes.TEXT, allowNull: false },
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: "visible",
            },
        },
        {
            sequelize,
            tableName: "community_comments",
            underscored: true,
            timestamps: true,
            indexes: [
                { fields: ["topic_id", "parent_comment_id", "status", "created_at"] },
                { fields: ["user_id", "created_at"] },
            ],
        }
    );
    return CommunityComment;
};

export default CommunityComment;