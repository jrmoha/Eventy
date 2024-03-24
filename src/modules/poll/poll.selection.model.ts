import { sequelize } from "./../../database/index";
import { DataTypes, Model } from "sequelize";
import Poll_Options from "./poll.options.model";
import User from "../user/user.model";

class Poll_Selection extends Model {
  declare option_id: number;
  declare user_id: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Poll_Selection.init(
  {
    option_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Poll_Selection",
    tableName: "poll_selection",
    timestamps: true,
  },
);

Poll_Selection.belongsTo(Poll_Options, {
  foreignKey: "option_id",
  targetKey: "id",
  as: "option",
});

Poll_Options.hasMany(Poll_Selection, {
  foreignKey: "option_id",
  sourceKey: "id",
  as: "selections",
});

Poll_Selection.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
});

User.hasMany(Poll_Selection, {
  foreignKey: "user_id",
  sourceKey: "id",
});

export default Poll_Selection;
