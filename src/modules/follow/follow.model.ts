import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database";
import User from "../user/user.model";

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

User.hasMany(Follow, {
  foreignKey: "follower_id",
  sourceKey: "id",
});
Follow.belongsTo(User, {
  foreignKey: "follower_id",
  targetKey: "id",
});
User.hasMany(Follow, {
  foreignKey: "followed_id",
  sourceKey: "id",
});
Follow.belongsTo(User, {
  foreignKey: "followed_id",
  targetKey: "id",
});

export default Follow;
