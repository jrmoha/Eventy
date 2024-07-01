import { sequelize } from "../../database/index";
import { DataTypes, Model } from "sequelize";
import Event from "../event/event.model";
import User from "../user/user.model";

class Attendance extends Model {
  declare event_id: number;
  declare user_id: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Attendance.init(
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
Attendance.belongsTo(Event, {
  foreignKey: "event_id",
  targetKey: "id",
});
Event.hasMany(Attendance, {
  foreignKey: "event_id",
  sourceKey: "id",
});

User.hasMany(Attendance, {
  foreignKey: "user_id",
  sourceKey: "id",
});
Attendance.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
});

export default Attendance;
