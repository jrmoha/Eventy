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

Event_Agenda.belongsTo(Event, {
  foreignKey: "event_id",
  targetKey: "id",
  as: "event",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default Event_Agenda;
