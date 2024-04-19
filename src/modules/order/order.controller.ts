/* eslint-disable no-case-declarations */
import { NextFunction, Request, Response } from "express-serve-static-core";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { APIError } from "../../types/APIError.error";
import StatusCodes from "http-status-codes";
import Ticket from "../event/event.tickets.model";
import Order from "./order.model";
import Stripe from "stripe";
import { sequelize } from "../../database";
import Event from "../event/event.model";
import Post from "../post/post.model";
import { PaymentService } from "../../utils/paymentService";
import { PaymentHandler } from "./order.service";
import config from "config";

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
      quantity,
      order,
      event,
      email,
      req,
      user_id,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      order,
      url: checkoutSession.url,
      session: checkoutSession,
    });
  },
);
export const webhook = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers["stripe-signature"];

    if (!sig) throw new APIError("No signature", StatusCodes.BAD_REQUEST);

    const endpointSecret = config.get<string>("stripe.endpoint_secret");
    const event = Stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    if (!event)
      throw new APIError("Invalid signature", StatusCodes.BAD_REQUEST);

    const { success: successHandler, failed: failedHandler } =
      new PaymentHandler();

    // Handle the event
    switch (event.type) {
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
        await failedHandler(event.data.object, req);
        break;
      case "checkout.session.async_payment_succeeded":
      case "checkout.session.completed":
        await successHandler(event.data.object, req);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.status(StatusCodes.OK).send(); // Return a 200 response to acknowledge receipt of the event
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
