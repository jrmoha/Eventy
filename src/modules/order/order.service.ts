import { sequelize } from "./../../database/index";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import { APIError } from "../../types/APIError.error";
import Ticket from "../event/event.tickets.model";
import Payment from "../payment/payment.model";
import Order, { OrderStatus } from "./order.model";
import { Request } from "express";
import { EncryptionService } from "../../utils/encryption";
import { QrCodeService } from "../../utils/qrcode";
import config from "config";

export class OrderService {
  constructor() {}
  public async success(
    checkoutSessionAsyncPaymentSucceeded: Stripe.Checkout.Session,
    req: Request,
  ) {
    const order_id = checkoutSessionAsyncPaymentSucceeded?.metadata?.order_id;
    const order = await Order.findOne({ where: { id: order_id } });

    if (!order) throw new APIError("Order not found", StatusCodes.NOT_FOUND);

    const user_id = checkoutSessionAsyncPaymentSucceeded?.metadata?.user_id;
    const transaction_id = checkoutSessionAsyncPaymentSucceeded?.payment_intent;

    const t = await sequelize.transaction();

    const payment = await Payment.create(
      {
        id: transaction_id,
        amount: checkoutSessionAsyncPaymentSucceeded.amount_total,
        status: "success",
        payment_method: "stripe",
        payment_type: "event",
        user_id,
        ip: req.ip,
      },
      { transaction: t },
    );

    order.payment_id = payment.id;
    order.status = OrderStatus.success;
    await order.save({ transaction: t });

    await Ticket.decrement("available", {
      by: order.quantity,
      where: { ticket_id: order.ticket_id },
      transaction: t,
    });
    //TODO:insert in event attendance
    //Encrypt the order_id using rsa encryption
    const encryptionService = new EncryptionService(
      config.get<string>("ticket.encryption_key") || "Hello dash",
    );
    const encryptedData = encryptionService.encrypt(order.id);

    //*************Generate a QR code for the ticket*************
    const qrCodeService = new QrCodeService();
    const qrCodeUrl = await qrCodeService.generate(encryptedData);
    console.log(qrCodeUrl);

    //TODO:Send the QR code to the user email
    //TODO:Send the user a receipt

    await t.commit();

    return;
  }

  public async failed(
    checkoutSessionAsyncPaymentFailed: Stripe.Checkout.Session,
    req: Request,
  ) {
    const order_id = checkoutSessionAsyncPaymentFailed?.metadata?.order_id;
    const order = await Order.findOne({ where: { id: order_id } });

    if (!order) throw new APIError("Order not found", StatusCodes.NOT_FOUND);

    const transaction_id = checkoutSessionAsyncPaymentFailed?.payment_intent;

    const payment = await Payment.create({
      id: transaction_id,
      amount: checkoutSessionAsyncPaymentFailed.amount_total,
      status: "failed",
      payment_method: "stripe",
      payment_type: "event",
      user_id: order.user_id,
      ip: req.ip,
    });

    order.status = OrderStatus.failed;
    order.payment_id = payment.id;
    await order.save();

    return;
  }
}
