import User from "../user/user.model";
import { sequelize } from "./../../database/index";
import { DataTypes, Model } from "sequelize";

enum PaymentStatus {
  pending = "pending",
  success = "success",
  failed = "failed",
}
enum PaymentMethod {
  stripe = "stripe",
}
enum PaymentType {
  event = "event",
}
class Payment extends Model {
  declare id: string;
  declare amount: number;
  declare status: PaymentStatus;
  declare payment_method: PaymentMethod;
  declare payment_type: PaymentType;
  declare user_id: number;
  declare ip?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        PaymentStatus.pending,
        PaymentStatus.success,
        PaymentStatus.failed,
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    payment_method: {
      type: DataTypes.ENUM(PaymentMethod.stripe),
      allowNull: false,
    },
    payment_type: {
      type: DataTypes.ENUM(PaymentType.event),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    ip: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    sequelize,
    modelName: "Payment",
    tableName: "payment",
  },
);

Payment.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
});

User.hasMany(Payment, {
  foreignKey: "user_id",
  sourceKey: "id",
});

export default Payment;
