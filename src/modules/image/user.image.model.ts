import { DataTypes } from "sequelize";
import { sequelize } from "./../../database/index";
import Image from "./image.model";

class UserImage extends Image {
  declare user_id: number;
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
  },
  {
    sequelize,
    tableName: "user_images",
    modelName: "UserImage",
    timestamps: true,
  },
);

export default UserImage;