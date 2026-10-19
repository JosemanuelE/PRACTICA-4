import { DataTypes, Model, Sequelize } from "sequelize";

interface IPlanProgress {
    id?: number;
    userId: number;
    diagnosticId: number;
    taskId: string;
    proof: string;
    createdAt?: Date;
}

class PlanProgress extends Model<IPlanProgress> implements IPlanProgress {
    declare id: number;
    declare userId: number;
    declare diagnosticId: number;
    declare taskId: string;
    declare proof: string;
    declare createdAt: Date;
}

export const initPlanProgressModel = (sequelize: Sequelize) => {
    PlanProgress.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: { type: DataTypes.INTEGER, allowNull: false },
            diagnosticId: { type: DataTypes.INTEGER, allowNull: false },
            taskId: { type: DataTypes.STRING(80), allowNull: false },
            proof: { type: DataTypes.STRING(400), allowNull: false },
        },
        {
            sequelize,
            tableName: "plan_progress",
            underscored: true,
            timestamps: true,
            updatedAt: false,
            indexes: [{ unique: true, fields: ["diagnostic_id", "task_id"] }],
        }
    );
    return PlanProgress;
};

export default PlanProgress;
