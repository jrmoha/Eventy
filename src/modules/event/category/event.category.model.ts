import { sequelize } from "../../../database/index";
import { DataTypes, Model } from "sequelize";
import Category from "../../category/category.model";
import Event from "../event.model";

class EventCategory extends Model {
  declare event_id: number;
  declare category: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

EventCategory.init(
  {
    event_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: "EventCategory",
    tableName: "event_categories",
    timestamps: true,
  },
);

EventCategory.belongsTo(Event, {
  foreignKey: "event_id",
  targetKey: "id",
});

Event.hasMany(EventCategory, {
  foreignKey: "event_id",
  sourceKey: "id",
});

EventCategory.belongsTo(Category, {
  foreignKey: "category",
  targetKey: "name",
});

Category.hasMany(EventCategory, {
  foreignKey: "category",
  sourceKey: "name",
});

export default EventCategory;
