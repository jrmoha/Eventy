import { OrderService } from "./order.service";
import { EncryptionService } from "./../../utils/encryption";
/* eslint-disable no-case-declarations */
import { NextFunction, Request, Response } from "express-serve-static-core";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { APIError } from "../../types/APIError.error";
import StatusCodes from "http-status-codes";
import Ticket from "../event/event.tickets.model";
import Order, { OrderStatus } from "./order.model";
import Stripe from "stripe";
import { sequelize } from "../../database";
import Event from "../event/event.model";
import Post from "../post/post.model";
import { PaymentService } from "../payment/payment.service";
import config from "config";
import Person from "../person/person.model";

export const orderTicket = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ticket_id, quantity } = req.body;
    const user_id = req.user?.id;
    const email = req.user?.email;

    if (!user_id || !email)
      throw new APIError("User not found", StatusCodes.BAD_REQUEST);

    const ticket = await Ticket.findOne({ where: { ticket_id } });

    if (!ticket) throw new APIError("Ticket not found", StatusCodes.NOT_FOUND);
    if (ticket.available === 0 || ticket.available < quantity)
      throw new APIError("Ticket not available", StatusCodes.BAD_REQUEST);

    const event = await Event.findOne({
      where: { id: ticket.event_id },
      include: [
        {
          model: Post,
          required: true,
          attributes: [],
        },
      ],
      attributes: [
        "id",
        "date",
        [sequelize.col("Post.organizer_id"), "organizer_id"],
        [sequelize.col("Post.status"), "status"],
        [sequelize.col("Post.content"), "content"],
      ],
    });

    if (!event) throw new APIError("Event not found", StatusCodes.NOT_FOUND);
    if (event.status !== "published")
      throw new APIError("Event not published", StatusCodes.BAD_REQUEST);
    if (new Date(event.date) < new Date())
      throw new APIError("Event has already passed", StatusCodes.BAD_REQUEST);

    const order = await Order.create({
      user_id,
      total: ticket.price * quantity,
      status: "pending", //default status
      ticket_id,
      quantity,
    });

    const paymentService = new PaymentService();
    const checkoutSession = await paymentService.checkout({
      ticket,
      order,
      event,
      user: req.user as Person,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      redirect_url: checkoutSession.url,
    });
  },
);
export const webhook = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers["stripe-signature"];

    if (!sig) throw new APIError("No signature", StatusCodes.BAD_REQUEST);

    const endpointSecret = config.get<string>("stripe.endpoint_secret");
    const stripeWebhookEvent = Stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret,
    );

    if (!stripeWebhookEvent)
      throw new APIError("Invalid signature", StatusCodes.BAD_REQUEST);

    const PaymentServiceInstance = new PaymentService();

    // Handle the event
    switch (stripeWebhookEvent.type) {
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
        await PaymentServiceInstance.handlePaymentFailure(
          stripeWebhookEvent.data.object,
          req,
        );
        break;
      case "checkout.session.async_payment_succeeded":
      case "checkout.session.completed":
        await PaymentServiceInstance.handlePaymentSuccess(
          stripeWebhookEvent.data.object,
          req,
        );
        break;
      default:
        console.log(`Unhandled event type ${stripeWebhookEvent.type}`);
    }

    return res.status(StatusCodes.OK).send(); // Return a 200 response to acknowledge receipt of the event
  },
);
export const orderDetails = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { enc } = req.params;

    const EncryptionServiceInstance = new EncryptionService(
      config.get<string>("ticket.encryption_key"),
    );
    const order_id = EncryptionServiceInstance.decodeURI(enc);
    const OrderServiceInstance = new OrderService();
    const order = await OrderServiceInstance.orderDetails(order_id);

    if (!order) throw new APIError("Order not found", StatusCodes.NOT_FOUND);
    if (order.status != OrderStatus.success)
      throw new APIError("Order not completed", StatusCodes.BAD_REQUEST);

    order.setDataValue(
      "event_date",
      new Date(order.dataValues.event_date).toDateString(),
    );

    return res.status(StatusCodes.OK).json({ success: true, data: order });
  },
);
export const success = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    return res.status(StatusCodes.OK).json({ success: true });
  },
);
export const cancel = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    return res.status(StatusCodes.OK).json({ success: true });
  },
);
