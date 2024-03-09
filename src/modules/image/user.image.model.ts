import { DataTypes } from "sequelize";
import { sequelize } from "./../../database/index";
import Image from "./image.model";
import User from "../user/user.model";

class UserImage extends Image {
  declare user_id: number;
  declare is_profile: boolean;
}

UserImage.init(
  {
    public_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    is_profile: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "user_images",
    modelName: "UserImage",
    timestamps: true,
  },
);

UserImage.belongsTo(Image, {
  foreignKey: "public_id",
  targetKey: "public_id",
});
Image.hasMany(UserImage, {
  foreignKey: "public_id",
  sourceKey: "public_id",
});
UserImage.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
});
User.hasMany(UserImage, {
  foreignKey: "user_id",
  sourceKey: "id",
});
export default UserImage;
