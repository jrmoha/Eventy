import { DataTypes } from "sequelize";
import { sequelize } from "./../../database/index";
import Poll from "./poll.model";

class Poll_Options extends Poll {
  declare id: number;
  declare poll_id: number;
  declare option: string;
  declare votes: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Poll_Options.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    option: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    votes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Poll_Options",
    tableName: "poll_options",
    timestamps: true,
  },
);

Poll_Options.belongsTo(Poll, {
  foreignKey: "poll_id",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export default Poll_Options;
