import { sequelize } from "./../../database/index";
import { DataTypes, Model } from "sequelize";

class Category extends Model {
  declare name: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Category.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    timestamps: true,
    tableName: "category",
    modelName: "Category",
    sequelize,
  },
);

export default Category;
