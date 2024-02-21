import { sequelize } from "./../../database/index";
import { DataTypes, Model } from "sequelize";
import Event from "./event.model";

class EventFAQ extends Model {
  declare id: number;
  declare event_id: number;
  declare question: string;
  declare answer: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

EventFAQ.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    event_id:{
      type: DataTypes.BIGINT,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: "EventFAQ",
    tableName: "event_faq",
    timestamps: true,
  },
);

EventFAQ.belongsTo(Event, {
  foreignKey: "event_id",
  targetKey: "id",
  as: "event",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default EventFAQ;
