import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../database";

class Friendship extends Model {
  declare sender_id: number;
  declare reciever_id: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Friendship.init(
  {
    sender_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    reciever_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    timestamps: true,
    tableName: "friendship",
    sequelize,
  },
);

export default Friendship;
