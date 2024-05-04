import { sequelize } from "../../database/index";
import Post from "../post/post.model";
import { DataTypes } from "sequelize";
import "./migration/event.migration";
class Event extends Post {
  declare location: string;
  declare date: Date;
  declare time: string;
  declare likes_count: number;
  declare interests_count: number;
  declare attendees_count: number;
  declare search: string;
}
Event.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    likes_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    interests_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    attendees_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    search: {
      type: DataTypes.TSVECTOR,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Event",
    tableName: "events",
    timestamps: true,
  },
);
Event.belongsTo(Post, {
  foreignKey: "id",
  targetKey: "id",
});

Post.hasOne(Event, {
  foreignKey: "id",
  sourceKey: "id",
});

export default Event;
