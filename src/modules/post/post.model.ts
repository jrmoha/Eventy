import Organizer from "../organizer/organizer.model";
import { sequelize } from "./../../database/index";
import { DataTypes, Model } from "sequelize";

class Post extends Model {
  declare id: number;
  declare content: string;
  declare organizer_id: number;
  declare status: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Post.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("published", "draft", "deleted"),
      allowNull: false,
      defaultValue: "published",
    },
  },
  {
    sequelize,
    modelName: "Post",
    tableName: "posts",
    timestamps: true,
  },
);

Post.belongsTo(Organizer, {
  foreignKey: "organizer_id",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default Post;
