import { DataTypes } from "sequelize";
import { sequelize } from "../../database";

class Organizer extends sequelize.models.User {
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
    modelName: "Organizer",
    sequelize,
  },
);

Organizer.belongsTo(sequelize.models.User, {
  foreignKey: "id",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default Organizer;
