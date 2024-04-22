import { Request } from "express";
import Stripe from "stripe";
import config from "config";
import { sequelize } from "../../database/index";
import { StatusCodes } from "http-status-codes";
import { APIError } from "../../error/api-error";
import Ticket from "../event/event.tickets.model";
import Payment from "./payment.model";
import Order, { OrderStatus } from "../order/order.model";
import { Encryption } from "../../utils/encryption";
import { sendTicketConfirmationEmail } from "../../interfaces/handlers/email/email.handler";
import Person from "../person/person.model";
import Event from "../event/event.model";
import Post from "../post/post.model";
import EventImage from "../image/event.image.model";
import Image from "../image/image.model";
import { QrCodeService } from "../../utils/qrcode";

type Checkout = {
  ticket: Ticket;
  order: Order;
  user: Person;
  event: Event;
};
export class PaymentService {
  private readonly stripe: Stripe;
  private readonly key: string;

  constructor() {
    this.key = config.get<string>("stripe.secret_key");
    this.stripe = new Stripe(this.key);
  }

  public async checkout({
    ticket,
    order,
    event,
    user,
  }: Checkout): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Ticket for " + event.content,
            },
            unit_amount: ticket.price * 100,
          },
          quantity: order.quantity,
        },
      ],
      mode: "payment",
      customer_email: user.email,
      success_url: "http://localhost:3000/api/v1/orders/success", //TODO: Change this to your success URL
      cancel_url: "http://localhost:3000/api/v1/orders/cancel", //TODO: Change this to your success URL
      metadata: {
        order_id: order.id,
        user_id: user.id,
      },
    });
  }
  public async handlePaymentSuccess(
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
    //TODO:insert in event attendance

    //*************Encrypt the order id*************
    const encryptionService = new Encryption(
      config.get<string>("ticket.encryption_key"),
    );
    const encryptedData = encryptionService.encodeURI(order.id);

    //*************Generate a QR code for the ticket*************
    const qrCodeService = new QrCodeService();
    const qrCodeUrl = await qrCodeService.generate(encryptedData);

    //TODO:Send the QR code to the user email
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

  public async handlePaymentFailure(
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
}
