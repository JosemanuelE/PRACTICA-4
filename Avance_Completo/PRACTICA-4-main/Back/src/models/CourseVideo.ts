import { DataTypes, Model, Sequelize } from "sequelize";

export interface ICourseVideoAttrs {
    id?: number;
    courseId: number;
    url: string;
    title: string | null;
    sortOrder: number;
}

class CourseVideo extends Model<ICourseVideoAttrs> implements ICourseVideoAttrs {
    declare id: number;
    declare courseId: number;
    declare url: string;
    declare title: string | null;
    declare sortOrder: number;
}

export const initCourseVideoModel = (sequelize: Sequelize) => {
    CourseVideo.init(
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
            url: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            title: {
                type: DataTypes.STRING(255),
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
            tableName: "course_videos",
            underscored: true,
            timestamps: false,
        }
    );
    return CourseVideo;
};

export default CourseVideo;
