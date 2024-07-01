import Event from "../event/event.model";
import User from "../user/user.model";
import { sequelize } from "../../database/index";
import { DataTypes, Model } from "sequelize";

class Rate extends Model {
  declare event_id: number;
  declare user_id: number;
  declare rate: number;
  declare review: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Rate.init(
  {
    event_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
    rate: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 5,
      },
    },
    review: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "rate",
    modelName: "Rate",
    sequelize,
  },
);

Rate.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
});

User.hasMany(Rate, {
  foreignKey: "user_id",
  sourceKey: "id",
});

Rate.belongsTo(Event, {
  foreignKey: "event_id",
  targetKey: "id",
});

Event.hasMany(Rate, {
  foreignKey: "event_id",
  sourceKey: "id",
});

export default Rate;
