import Event from "../event/event.model";
import User from "../user/user.model";
import { sequelize } from "../../database/index";
import { DataTypes, Model } from "sequelize";

class Like extends Model {
  declare user_id: number;
  declare event_id: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Like.init(
  {
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
    event_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Like",
    tableName: "likes",
    timestamps: true,
  },
);

Like.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
});
User.hasMany(Like, {
  foreignKey: "user_id",
  sourceKey: "id",
});

Like.belongsTo(Event, {
  foreignKey: "event_id",
  targetKey: "id",
});
Event.hasMany(Like, {
  foreignKey: "event_id",
  sourceKey: "id",
});
export default Like;
