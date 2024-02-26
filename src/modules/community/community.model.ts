import Event from "../event/event.model";
import { sequelize } from "./../../database/index";
import { DataTypes, Model } from "sequelize";

class Community extends Model {
  public declare id: number;
  public declare name: string;
  public declare status: "active" | "archived";
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Community.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "archived"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: "Community",
    tableName: "community",
  },
);
Community.belongsTo(Event, {
  foreignKey: "id",
  targetKey: "id",
});

Event.hasMany(Community, {
  foreignKey: "id",
  sourceKey: "id",
});

export default Community;
