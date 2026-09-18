import { DataTypes, Model, Sequelize } from "sequelize";

export interface ILoginGuardAttrs {
    identifier: string;
    failCount: number;
    lockedUntil?: Date | null;
}

class LoginGuard extends Model<ILoginGuardAttrs> implements ILoginGuardAttrs {
    declare identifier: string;
    declare failCount: number;
    declare lockedUntil: Date | null;
}

export const initLoginGuardModel = (sequelize: Sequelize) => {
    LoginGuard.init(
        {
            identifier: {
                type: DataTypes.STRING(180),
                primaryKey: true,
            },
            failCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            lockedUntil: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: "login_guards",
            underscored: true,
            timestamps: true,
        }
    );
    return LoginGuard;
};

export default LoginGuard;
