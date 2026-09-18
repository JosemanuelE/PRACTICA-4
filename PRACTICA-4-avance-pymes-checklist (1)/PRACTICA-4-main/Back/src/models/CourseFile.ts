import { DataTypes, Model, Sequelize } from "sequelize";

export interface ICourseFileAttrs {
    id?: number;
    courseId: number;
    name: string;
    url: string;
    sortOrder: number;
}

class CourseFile extends Model<ICourseFileAttrs> implements ICourseFileAttrs {
    declare id: number;
    declare courseId: number;
    declare name: string;
    declare url: string;
    declare sortOrder: number;
}

export const initCourseFileModel = (sequelize: Sequelize) => {
    CourseFile.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            courseId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            url: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            sortOrder: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            sequelize,
            tableName: "course_files",
            underscored: true,
            timestamps: false,
        }
    );
    return CourseFile;
};

export default CourseFile;
