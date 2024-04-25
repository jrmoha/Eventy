import { sequelize } from "../../../database/index";
import { DataTypes, Model } from "sequelize";
import Event from "../event.model";

class Ticket extends Model {
  declare ticket_id: number;
  declare event_id: number;
  declare price: number;
  declare class: string;
  declare quantity: number;
  declare available: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Ticket.init(
  {
    ticket_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    class: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    available: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Ticket",
    tableName: "tickets",
    timestamps: true,
  },
);
Event.hasMany(Ticket, {
  foreignKey: "event_id",
  sourceKey: "id",
});

Ticket.belongsTo(Event, {
  foreignKey: "event_id",
  targetKey: "id",
});
export default Ticket;
