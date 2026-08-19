import { DataTypes, Model, Sequelize } from "sequelize";

export type DiagnosticAnswer = "si" | "no" | "parcial";

export interface IDiagnosticAttrs {
    id?: number;
    userId: number;
    companyName: string | null;
    answers: Record<string, DiagnosticAnswer>;
    securityScore: number;
    riskScore: number;
    weakestPoint: string;
    createdAt?: Date;
}

class Diagnostic extends Model<IDiagnosticAttrs> implements IDiagnosticAttrs {
    declare id: number;
    declare userId: number;
    declare companyName: string | null;
    declare answers: Record<string, DiagnosticAnswer>;
    declare securityScore: number;
    declare riskScore: number;
    declare weakestPoint: string;
    declare createdAt: Date;
}

export const initDiagnosticModel = (sequelize: Sequelize) => {
    Diagnostic.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            companyName: {
                type: DataTypes.STRING(150),
                allowNull: true,
            },
            answers: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            securityScore: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            riskScore: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            weakestPoint: {
                type: DataTypes.STRING(150),
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: "diagnostics",
            underscored: true,
            timestamps: true,
            updatedAt: false,
        }
    );
    return Diagnostic;
};

export default Diagnostic;
