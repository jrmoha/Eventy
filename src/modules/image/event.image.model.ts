import { DataTypes } from "sequelize";
import { sequelize } from "./../../database/index";
import Image from "./image.model";
import Event from "../event/event.model";

class EventImage extends Image {
  declare event_id: number;
}

EventImage.init(
  {
    public_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: "EventImage",
    tableName: "event_images",
    timestamps: true,
  },
);

EventImage.belongsTo(Event, {
  foreignKey: "event_id",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

EventImage.belongsTo(Image, {
  foreignKey: "public_id",
  targetKey: "public_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default EventImage;
