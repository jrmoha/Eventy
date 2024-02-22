import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../database";
import User from "../user/user.model";

class Friendship extends Model {
  declare sender_id: number;
  declare receiver_id: number;
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
    receiver_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    timestamps: true,
    tableName: "friendship",
    modelName: "Friendship",
    sequelize,
  },
);

Friendship.belongsTo(User, {
  foreignKey: "sender_id",
  targetKey: "id",
});
User.hasMany(Friendship, {
  foreignKey: "sender_id",
  sourceKey: "id",
});
Friendship.belongsTo(User, {
  foreignKey: "receiver_id",
  targetKey: "id",
});
User.hasMany(Friendship, {
  foreignKey: "receiver_id",
  sourceKey: "id",
});

export default Friendship;
