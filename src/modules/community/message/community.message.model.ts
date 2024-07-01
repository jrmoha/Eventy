import { sequelize } from "../../../database/index";
import { DataTypes, Model } from "sequelize";
import Community from "../community.model";
import User from "../../user/user.model";

class CommunityMessage extends Model {
  declare id: number;
  declare community_id: number;
  declare sender_id: number;
  declare message: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

CommunityMessage.init(
  {
    community_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "community_message",
    modelName: "CommunityMessage",
    sequelize,
  },
);

CommunityMessage.belongsTo(Community, {
  foreignKey: "community_id",
  targetKey: "id",
});

Community.hasMany(CommunityMessage, {
  foreignKey: "community_id",
  sourceKey: "id",
});

CommunityMessage.belongsTo(User, {
  foreignKey: "sender_id",
  targetKey: "id",
});

User.hasMany(CommunityMessage, {
  foreignKey: "sender_id",
  sourceKey: "id",
});

export default CommunityMessage;
