import { sequelize } from "./../../database/index";
import { DataTypes, Model } from "sequelize";
import Event from "./event.model";

class Event_Agenda extends Model {
  declare id: number;
  declare event_id: number;
  declare description: string;
  declare start_time: string;
  declare end_time: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Event_Agenda.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Event_Agenda",
    tableName: "event_agenda",
    timestamps: true,
  },
);
Event.hasMany(Event_Agenda, {
  foreignKey: "event_id",
  sourceKey: "id",
});

Event_Agenda.belongsTo(Event, {
  foreignKey: "event_id",
  targetKey: "id",
});

export default Event_Agenda;
