import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../database";
import User from "../user/user.model";

class Block extends Model {
  declare blocker_id: number;
  declare blocked_id: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Block.init(
  {
    blocker_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    blocked_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    timestamps: true,
    tableName: "block",
    modelName: "Block",
    sequelize,
  },
);
Block.belongsTo(User, {
  foreignKey: "blocker_id",
  targetKey: "id",
});

User.hasMany(Block, {
  foreignKey: "blocker_id",
  sourceKey: "id",
});

Block.belongsTo(User, {
  foreignKey: "blocked_id",
  targetKey: "id",
});

User.hasMany(Block, {
  foreignKey: "blocked_id",
  sourceKey: "id",
});

export default Block;
