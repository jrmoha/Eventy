import { sequelize } from "../../../database/index";
import { DataTypes, Model } from "sequelize";
import User from "../user.model";

export enum Visibility {
  Anyone = "anyone",
  Friends = "friends",
  None = "none",
}

class Settings extends Model {
  declare user_id: number;
  declare allow_marketing_emails: boolean;
  declare allow_reminders: boolean;
  declare friends_visibility: Visibility;
  declare followers_visibility: Visibility;
  declare following_visibility: Visibility;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Settings.init(
  {
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    allow_marketing_emails: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    allow_reminders: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    friends_visibility: {
      type: DataTypes.ENUM(
        Visibility.Anyone,
        Visibility.Friends,
        Visibility.None,
      ),
      allowNull: false,
      defaultValue: Visibility.Anyone,
    },
    followers_visibility: {
      type: DataTypes.ENUM(
        Visibility.Anyone,
        Visibility.Friends,
        Visibility.None,
      ),
      allowNull: false,
      defaultValue: Visibility.Anyone,
    },
    following_visibility: {
      type: DataTypes.ENUM(
        Visibility.Anyone,
        Visibility.Friends,
        Visibility.None,
      ),
      allowNull: false,
      defaultValue: Visibility.Anyone,
    },
  },
  {
    timestamps: true,
    tableName: "settings",
    modelName: "Settings",
    sequelize,
  },
);

Settings.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
  as: "user",
});

User.hasOne(Settings, {
  foreignKey: "user_id",
  sourceKey: "id",
  as: "settings",
});

export default Settings;
