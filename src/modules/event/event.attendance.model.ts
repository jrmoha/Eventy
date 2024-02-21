import { sequelize } from "./../../database/index";
import { DataTypes, Model } from "sequelize";
import Event from "./event.model";
import User from "../user/user.model";

class Event_Attendance extends Model {
  declare event_id: number;
  declare user_id: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Event_Attendance.init(
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
    modelName: "Event_Attendance",
    tableName: "event_attendance",
    timestamps: true,
  },
);

Event_Attendance.belongsTo(Event, {
  foreignKey: "event_id",
  targetKey: "id",
  as: "event",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Event_Attendance.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default Event_Attendance;
