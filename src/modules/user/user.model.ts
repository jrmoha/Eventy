import { DataTypes } from "sequelize";
import { sequelize } from "../../database";
import Person from "../person/person.model";

class User extends Person {
  declare followers_count: number;
  declare following_count: number;
  declare friends_count: number;
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    followers_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    following_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    friends_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: "user",
    modelName: "user",
    sequelize,
  },
);

User.belongsTo(Person, {
  foreignKey: "id",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default User;
