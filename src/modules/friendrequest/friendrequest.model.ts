import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../database";

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

export default FriendRequest;
