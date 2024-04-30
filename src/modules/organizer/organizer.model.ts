import { DataTypes } from "sequelize";
import { sequelize } from "../../database";
import User from "../user/user.model";

class Organizer extends User {
  declare bio: string;
  declare rate: number;
  declare rates_count: number;
  declare events_count: number;
}

Organizer.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    bio: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    rates_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    events_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: "organizer",
    modelName: "Organizer",
    sequelize,
  },
);
Organizer.belongsTo(User, {
  foreignKey: "id",
  targetKey: "id",
});

User.hasOne(Organizer, {
  foreignKey: "id",
  sourceKey: "id",
});

export default Organizer;
