import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../database";

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
    sequelize,
  },
);

export default Block;
