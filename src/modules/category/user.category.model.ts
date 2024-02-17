import { sequelize } from "./../../database/index";
import { DataTypes, Model } from "sequelize";

class UserCategory extends Model {
  declare id: number;
  declare name: string;
}

UserCategory.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "user_category",
    modelName: "UserCategory",
    sequelize,
  },
);

export default UserCategory;
