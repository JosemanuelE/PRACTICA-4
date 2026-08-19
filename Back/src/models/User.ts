import { DataTypes, Model } from "sequelize";
import { Sequelize } from "sequelize";

export type UserRole = "user" | "admin";

interface IUser {
    id?: number;
    name: string;
    email: string;
    password: string;
    progress?: number;
    role?: UserRole;
    emailVerified?: boolean;
}

class User extends Model<IUser> implements IUser {
    declare id: number;
    declare name: string;
    declare email: string;
    declare password: string;
    declare progress: number;
    declare role: UserRole;
    declare emailVerified: boolean;
}

export const initUserModel = (sequelize: Sequelize) => {
    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            progress: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            role: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: "user",
            },
            emailVerified: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: "email_verified",
            },
        },
        {
            sequelize,
            tableName: "users",
            timestamps: false,
        }
    );

    return User;
};

export default User;
