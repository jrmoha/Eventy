import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database";
import User from "../user/user.model";
import Event from "../event/event.model";

class Comment extends Model {
  declare id: number;
  declare user_id: number;
  declare event_id: number;
  declare comment: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    event_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Comment",
    tableName: "comments",
    timestamps: true,
  },
);

Comment.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
});

User.hasMany(Comment, {
  foreignKey: "user_id",
  sourceKey: "id",
});

Comment.belongsTo(Event, {
  foreignKey: "event_id",
  targetKey: "id",
});

Event.hasMany(Comment, {
  foreignKey: "event_id",
  sourceKey: "id",
});

export default Comment;
