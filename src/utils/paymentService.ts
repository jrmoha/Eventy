import config from "config";
import Stripe from "stripe";
import Ticket from "../modules/event/event.tickets.model";
import Order from "../modules/order/order.model";
import Event from "../modules/event/event.model";
import { Request } from "express";

type Checkout = {
  ticket: Ticket;
  quantity: number;
  order: Order;
  user_id: number;
  email: string;
  event: Event;
  req: Request;
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
    quantity,
    order,
    event,
    email,
    req,
    user_id,
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
          quantity,
        },
      ],
      mode: "payment",
      customer_email: email,
      success_url: "http://localhost:3000/api/v1/orders/success", //TODO: Change this to your success URL
      cancel_url: "http://localhost:3000/api/v1/orders/cancel", //TODO: Change this to your success URL
      metadata: {
        order_id: order.id,
        user_id,
      },
    });
  }
}
