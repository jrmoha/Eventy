import Event from "../event/event.model";
import { sequelize } from "./../../database/index";
import { DataTypes, Model } from "sequelize";
import Category from "./category.model";

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
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

EventCategory.belongsTo(Category, {
  foreignKey: "category",
  targetKey: "name",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default EventCategory;