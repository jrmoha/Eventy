import { sequelize } from "../../../database/index";
import { DataTypes, Model } from "sequelize";
import Category from "../../category/category.model";
import User from "../user.model";

class UserCategory extends Model {
  declare category: string;
  declare user_id: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

UserCategory.init(
  {
    category: {
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
