import { sequelize } from "./../../database/index";
import { DataTypes, Model } from "sequelize";
import Event from "./event.model";

class Event_Phone extends Model {
  declare id: number;
  declare event_id: number;
  declare phone: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
Event_Phone.init(
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
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Event_Phone",
    tableName: "event_phone",
    timestamps: true,
  },
);
Event_Phone.belongsTo(Event, {
  foreignKey: "event_id",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
export default Event_Phone;
