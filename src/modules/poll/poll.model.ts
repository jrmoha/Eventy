import { sequelize } from "./../../database/index";
import { DataTypes } from "sequelize";
import Post from "../post/post.model";

class Poll extends Post {
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Poll.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: "Poll",
    tableName: "polls",
    timestamps: true,
  },
);

Poll.belongsTo(Post, {
  foreignKey: "id",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default Poll;
