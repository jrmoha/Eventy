import { sequelize } from "./../../database/index";
import { DataTypes, Model } from "sequelize";
import Community from "./community.model";
import User from "../user/user.model";

class CommunityMembership extends Model {
  declare community_id: number;
  declare user_id: number;
  declare role: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

CommunityMembership.init(
  {
    community_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "member"),
      allowNull: false,
      defaultValue: "member",
    },
  },
  {
    timestamps: true,
    tableName: "community_membership",
    modelName: "CommunityMembership",
    sequelize,
  },
);

Community.hasMany(CommunityMembership, {
  foreignKey: "community_id",
  sourceKey: "id",
});
CommunityMembership.belongsTo(Community, {
  foreignKey: "community_id",
  targetKey: "id",
});
User.hasMany(CommunityMembership, {
  foreignKey: "community_id",
  sourceKey: "id",
});
CommunityMembership.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
});

export default CommunityMembership;
