import { DataTypes, Model, Sequelize } from "sequelize";

export interface ICourseAttrs {
    id?: number;
    title: string;
    description: string | null;
    sortOrder: number;
}

class Course extends Model<ICourseAttrs> implements ICourseAttrs {
    declare id: number;
    declare title: string;
    declare description: string | null;
    declare sortOrder: number;
}

export const initCourseModel = (sequelize: Sequelize) => {
    Course.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            sortOrder: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            sequelize,
            tableName: "courses",
            underscored: true,
            timestamps: false,
        }
    );
    return Course;
};

export default Course;
