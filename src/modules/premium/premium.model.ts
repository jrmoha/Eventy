import Payment from "../payment/payment.model";
import User from "../user/user.model";
import { sequelize } from "../../database/index";
import { DataTypes, Model } from "sequelize";

export default class PremiumUser extends Model {
  declare user_id: number;
  declare payment_id: string;
  declare start_date: Date;
  declare end_date: Date;
  declare can_remove_ads: boolean;
  declare can_allow_waiting_list: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

PremiumUser.init(
  {
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    payment_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    can_remove_ads: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    can_allow_waiting_list: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Premium",
    tableName: "premiums",
    timestamps: true,
  },
);

PremiumUser.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasOne(PremiumUser, {
  foreignKey: "user_id",
  sourceKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Payment.hasOne(PremiumUser, {
  foreignKey: "payment_id",
  as: "payment",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

PremiumUser.belongsTo(Payment, {
  foreignKey: "payment_id",
  as: "payment",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
