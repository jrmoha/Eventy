import { DataTypes } from "sequelize";
import { sequelize } from "./../../database/index";
import Image from "./image.model";

class SystemImage extends Image {
  declare user_id: number;
}

SystemImage.init(
  {
    public_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: "system_images",
    modelName: "SystemImage",
    timestamps: true,
  },
);

SystemImage.belongsTo(Image, {
  foreignKey: "public_id",
  targetKey: "public_id",
});
Image.hasMany(SystemImage, {
  foreignKey: "public_id",
  sourceKey: "public_id",
});

export default SystemImage;
