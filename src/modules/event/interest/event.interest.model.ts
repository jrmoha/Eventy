import { sequelize } from "../../../database/index";
import { DataTypes, Model } from "sequelize";
import Event from "../event.model";
import User from "../../user/user.model";

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
});
Event.hasMany(Event_Interest, {
  foreignKey: "event_id",
  sourceKey: "id",
});
Event_Interest.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
});
User.hasMany(Event_Interest, {
  foreignKey: "user_id",
  sourceKey: "id",
});

export default Event_Interest;
