import config from "config";
import { FindAttributeOptions } from "sequelize";
import { sequelize } from "../../database";
import Event from "../event/event.model";
import Ticket from "../event/tickets/event.tickets.model";
import Person from "../person/person.model";
import Post from "../post/post.model";
import User from "../user/user.model";
import Order, { OrderStatus } from "./order.model";
import { APIError } from "../../error/api-error";
import Stripe from "stripe";
import { StatusCodes } from "http-status-codes";
import Payment from "../payment/payment.model";
import { Request } from "express";
import { sendTicketConfirmationEmail } from "../../interfaces/handlers/email/email.handler";
import { QrCodeService } from "../../lib/qrcode";
import { Encryption } from "../../lib/encryption";
import Image from "../image/image.model";
import EventImage from "../event/image/event.image.model";

export class OrderService {
  constructor() {}
  public async orderDetails(order_id: string) {
    const attributes: FindAttributeOptions = [
      "status",
      [sequelize.col("Order.total"), "amount_paid"],
      [sequelize.col("Order.quantity"), "seats"],
      [sequelize.col("Ticket.class"), "ticket_class"],
      [
        sequelize.fn(
          "concat",
          sequelize.col("User.Person.first_name"),
          " ",
          sequelize.col("User.Person.last_name"),
        ),
        "full_name",
      ],
      [sequelize.col("Ticket.Event.Post.content"), "event"],
      [sequelize.col("Ticket.Event.date"), "event_date"],
      [
        sequelize.literal(
          `EXISTS (SELECT 1 FROM "event_attendance" WHERE "event_attendance"."user_id" = "Order"."user_id" AND "event_attendance"."event_id" = "Ticket"."event_id")`,
        ),
        "attended",
      ],
    ];
    const include = [
      {
        model: Ticket,
        required: true,
        attributes: [],
        include: [
          {
            model: Event,
            required: true,
            attributes: [],
            include: [
              {
                model: Post,
                required: true,
                attributes: [],
              },
            ],
          },
        ],
      },
      {
        model: User,
        required: true,
        attributes: [],
        include: [
          {
            model: Person,
            required: true,
            attributes: [],
          },
        ],
      },
    ];
    return Order.findOne({
      where: { id: order_id },
      include,
      attributes,
    });
  }
  public async handleOrderSuccess(
    checkoutSessionAsyncPaymentSucceeded: Stripe.Checkout.Session,
    req: Request,
  ): Promise<void> | never {
    const order_id = checkoutSessionAsyncPaymentSucceeded?.metadata?.order_id;
    const order = await Order.findOne({ where: { id: order_id } });

    if (!order) throw new APIError("Order not found", StatusCodes.NOT_FOUND);
    if (order.status == OrderStatus.success) return;
    if (order.status == OrderStatus.failed)
      throw new APIError("Order failed", StatusCodes.BAD_REQUEST);

    const user_id = checkoutSessionAsyncPaymentSucceeded?.metadata?.user_id;
    const user = await Person.findOne({ where: { id: user_id } });
    if (!user) throw new APIError("User not found", StatusCodes.NOT_FOUND);

    const payment_transaction_id =
      checkoutSessionAsyncPaymentSucceeded?.payment_intent;

    const t = await sequelize.transaction();

    const payment = await Payment.create(
      {
        id: payment_transaction_id,
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

    const ticket = await Ticket.findOne({
      where: { ticket_id: order.ticket_id },
    });
    if (!ticket) throw new APIError("Ticket not found", StatusCodes.NOT_FOUND);
    ticket.available -= order.quantity;
    await ticket.save({ transaction: t });

    const event_id = ticket.event_id;
    const event = await Event.findByPk(event_id, {
      include: [
        {
          model: Post,
          required: true,
          attributes: [],
        },
        {
          model: EventImage,
          required: true,
          attributes: [],
          include: [
            {
              model: Image,
              required: true,
              attributes: [],
            },
          ],
        },
      ],
      attributes: [
        [sequelize.col("Post.content"), "content"],
        [sequelize.col("EventImages.Image.secure_url"), "logo"],
      ],
    });
    if (!event) throw new APIError("Event not found", StatusCodes.NOT_FOUND);

    //Encrypt the order id
    const encryptionService = new Encryption(
      config.get<string>("ticket.encryption_key"),
    );
    const encryptedData = encryptionService.encodeURI(order.id);

    const url = `${config.get<string>("client_url")}/preview/${encryptedData}`;
    //Generate a QR code for the ticket
    const qrCodeService = new QrCodeService();
    const qrCodeUrl = await qrCodeService.generate(url);

    //Send the QR code to the user email
    await sendTicketConfirmationEmail(
      user,
      qrCodeUrl,
      event.content,
      event.dataValues.logo,
      order,
      ticket,
    );

    await t.commit();

    return;
  }

  public async handleOrderFailure(
    checkoutSessionAsyncPaymentFailed: Stripe.Checkout.Session,
    req: Request,
  ) {
    const order_id = checkoutSessionAsyncPaymentFailed?.metadata?.order_id;
    const order = await Order.findOne({ where: { id: order_id } });

    if (!order) throw new APIError("Order not found", StatusCodes.NOT_FOUND);

    const transaction_id = checkoutSessionAsyncPaymentFailed?.payment_intent;

    const t = await sequelize.transaction();

    const payment = await Payment.create(
      {
        id: transaction_id,
        amount: checkoutSessionAsyncPaymentFailed.amount_total,
        status: "failed",
        payment_method: "stripe",
        payment_type: "event",
        user_id: order.user_id,
        ip: req.ip,
      },
      { transaction: t },
    );

    order.status = OrderStatus.failed;
    order.payment_id = payment.id;
    await order.save({ transaction: t });

    await t.commit();

    return;
  }

  public async orderBuyers(event: Event): Promise<Order[]> {
    return Order.findAll({
      include: [
        {
          model: Ticket,
          required: true,
        },
      ],
      where: {
        "$Ticket.event_id$": event.id,
      },
      attributes: ["user_id", [sequelize.col("Ticket.event_id"), "event_id"]],
    });
  }
}
