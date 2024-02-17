import { DataTypes } from "sequelize";
import { sequelize } from "../../database";
import User from "../user/user.model";
import Person from "../person/person.model";

class Organizer extends User {
  declare rate: number;
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
    rate: {
      type: DataTypes.INTEGER,
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
    modelName: "organizer",
    sequelize,
  },
);

Organizer.belongsTo(User, {
  foreignKey: "id",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Organizer.belongsTo(Person, {
  foreignKey: "id",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default Organizer;
