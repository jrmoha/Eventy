import Post from "../post/post.model";
import { sequelize } from "./../../database/index";
import { DataTypes } from "sequelize";

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

Poll.belongsTo(Post);
Post.hasOne(Poll);

export default Poll;
