import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database";

class Image extends Model {
  declare public_id: string;
  declare url: string;
  declare secure_url: string;
  declare size: number;
  declare format: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Image.init(
  {
    public_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    secure_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    format: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "image",
    modelName: "Image",
    sequelize,
  },
);

 
export default Image;
