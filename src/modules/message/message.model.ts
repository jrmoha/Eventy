import { sequelize } from "../../database/index";
import { DataTypes, Model } from "sequelize";
import Inbox from "../inbox/inbox.model";
import User from "../user/user.model";

class Message extends Model {
  declare id: number;
  declare inbox_id: number;
  declare sender_id: number;
  declare receiver_id: number;
  declare message: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    inbox_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    receiver_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "message",
    modelName: "Message",
    timestamps: true,
  },
);

Message.belongsTo(Inbox, {
  foreignKey: "inbox_id",
  targetKey: "id",
});
Inbox.hasMany(Message, {
  foreignKey: "inbox_id",
  sourceKey: "id",
});

Message.belongsTo(User, {
  foreignKey: "sender_id",
  targetKey: "id",
  as: "sender",
});

Message.belongsTo(User, {
  foreignKey: "receiver_id",
  targetKey: "id",
  as: "receiver",
});

User.hasMany(Message, {
  foreignKey: "sender_id",
  sourceKey: "id",
});

User.hasMany(Message, {
  foreignKey: "receiver_id",
  sourceKey: "id",
});

export default Message;
