import Post from "../post/post.model";
import { sequelize } from "./../../database/index";
import { DataTypes } from "sequelize";

class Poll extends Post {
  declare multi_selection: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Poll.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    multi_selection: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
});
Post.hasOne(Poll, {
  foreignKey: "id",
  sourceKey: "id",
});

export default Poll;
