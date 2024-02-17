import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database";

class Follow extends Model {
  declare follower_id: number;
  declare followed_id: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Follow.init(
  {
    follower_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    followed_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    timestamps: true,
    sequelize,
   tableName: "follow",
   modelName: "Follow",
  },
);

export default Follow;
