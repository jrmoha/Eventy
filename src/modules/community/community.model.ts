import Event from "../event/event.model";
import { sequelize } from "../../database/index";
import { DataTypes, Model } from "sequelize";

class Community extends Model {
  public declare id: number;
  public declare name: string;
  public declare status: "active" | "archived";
  public declare last_message: string;
  public declare last_message_time: Date;
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
    last_message: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_message_time: {
      type: DataTypes.DATE,
      allowNull: true,
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
