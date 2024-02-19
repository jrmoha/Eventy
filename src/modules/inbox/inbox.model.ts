import User from "../user/user.model";
import { sequelize } from "./../../database/index";
import { DataTypes, Model } from "sequelize";

class Inbox extends Model {
  declare id: number;
  declare sender_id: number;
  declare receiver_id: number;
  declare last_message: string;
  declare last_message_time: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Inbox.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    receiver_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    last_message: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    last_message_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "inbox",
    modelName: "Inbox",
    timestamps: true,
  },
);

Inbox.belongsTo(User, {
  foreignKey: "sender_id",
  as: "sender",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Inbox.belongsTo(User, {
  foreignKey: "receiver_id",
  as: "receiver",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default Inbox;
