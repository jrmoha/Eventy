import Event from "../event/event.model";
import { sequelize } from "./../../database/index";
import { DataTypes, Model } from "sequelize";

class Community extends Model {
  public declare id: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Community.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
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
