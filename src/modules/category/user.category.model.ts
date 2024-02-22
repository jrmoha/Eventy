import { sequelize } from "./../../database/index";
import { DataTypes, Model } from "sequelize";
import Category from "./category.model";
import User from "../user/user.model";

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
Category.hasMany(UserCategory, {
  foreignKey: "category",
  sourceKey: "name",
});
UserCategory.belongsTo(Category, {
  foreignKey: "category",
  targetKey: "name",
});
User.hasMany(UserCategory, {
  foreignKey: "user_id",
  sourceKey: "id",
});
UserCategory.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
});
export default UserCategory;
