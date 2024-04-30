import Ticket from "../event/tickets/event.tickets.model";
import Payment from "../payment/payment.model";
import User from "../user/user.model";
import { sequelize } from "../../database/index";
import { DataTypes, Model } from "sequelize";

export enum OrderStatus {
  pending = "pending",
  success = "success",
  failed = "failed",
}

class Order extends Model {
  declare id: string;
  declare user_id: number;
  declare total: number;
  declare payment_id: string;
  declare status: OrderStatus;
  declare ticket_id: number;
  declare quantity: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        OrderStatus.pending,
        OrderStatus.success,
        OrderStatus.failed,
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    ticket_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    sequelize,
    modelName: "Order",
    tableName: "orders",
  },
);

Order.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "id",
});
User.hasMany(Order, {
  foreignKey: "user_id",
  sourceKey: "id",
});

Order.belongsTo(Payment, {
  foreignKey: "payment_id",
  targetKey: "id",
});

Payment.hasOne(Order, {
  foreignKey: "payment_id",
  sourceKey: "id",
});

Order.belongsTo(Ticket, {
  foreignKey: "ticket_id",
  targetKey: "ticket_id",
});
Ticket.hasMany(Order, {
  foreignKey: "ticket_id",
  sourceKey: "ticket_id",
});

export default Order;
