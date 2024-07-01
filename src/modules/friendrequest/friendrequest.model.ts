import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../database";
import User from "../user/user.model";

class FriendRequest extends Model {
  declare sender_id: number;
  declare receiver_id: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

FriendRequest.init(
  {
    sender_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    receiver_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    timestamps: true,
    tableName: "friend_request",
    modelName: "FriendRequest",
    sequelize,
  },
);

FriendRequest.belongsTo(User, {
  foreignKey: "sender_id",
  targetKey: "id",
  as: "sender",
});
User.hasMany(FriendRequest, {
  foreignKey: "sender_id",
  sourceKey: "id",
});
FriendRequest.belongsTo(User, {
  foreignKey: "receiver_id",
  targetKey: "id",
  as: "receiver",
});
User.hasMany(FriendRequest, {
  foreignKey: "receiver_id",
  sourceKey: "id",
});

export default FriendRequest;
