import { sequelize } from "./../../database/index";
import { DataTypes, Model } from "sequelize";
import Event from "./event.model";
import User from "../user/user.model";

class Event_Interest extends Model {
  declare event_id: number;
  declare user_id: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Event_Interest.init(
  {
    event_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Event_Interest",
    tableName: "event_interest",
    timestamps: true,
  },
);

Event_Interest.belongsTo(Event, {
  foreignKey: "event_id",
  targetKey: "id",
  as: "event",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Event_Interest.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default Event_Interest;
