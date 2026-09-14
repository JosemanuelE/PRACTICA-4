import { DataTypes, Model, Sequelize } from "sequelize";

export type AuthTokenType = "email_verify" | "password_reset";

export interface IAuthTokenAttrs {
    id?: number;
    userId: number;
    type: AuthTokenType;
    tokenHash: string;
    expiresAt: Date;
    usedAt?: Date | null;
}

class AuthToken extends Model<IAuthTokenAttrs> implements IAuthTokenAttrs {
    declare id: number;
    declare userId: number;
    declare type: AuthTokenType;
    declare tokenHash: string;
    declare expiresAt: Date;
    declare usedAt: Date | null;
}

export const initAuthTokenModel = (sequelize: Sequelize) => {
    AuthToken.init(
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
            type: {
                type: DataTypes.STRING(30),
                allowNull: false,
            },
            tokenHash: {
                type: DataTypes.STRING(64),
                allowNull: false,
                unique: true,
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            usedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: "auth_tokens",
            underscored: true,
            timestamps: true,
            updatedAt: false,
        }
    );
    return AuthToken;
};

export default AuthToken;
