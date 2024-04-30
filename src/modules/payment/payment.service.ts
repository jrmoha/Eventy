import Stripe from "stripe";
import config from "config";
import Ticket from "../event/tickets/event.tickets.model";
import Order from "../order/order.model";
import Person from "../person/person.model";
import Event from "../event/event.model";
import { Request } from "express";

type TicketCheckout = {
  req: Request;
  ticket: Ticket;
  order: Order;
  user: Person;
  event: Event;
};
type PremiumCheckout = {
  req: Request;
  user: Person;
};
export class PaymentService {
  private readonly stripe: Stripe;
  private readonly key: string;

  constructor() {
    this.key = config.get<string>("stripe.secret_key");
    this.stripe = new Stripe(this.key);
  }
  public async premium_checkout({
    req,
    user,
  }: PremiumCheckout): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Premium Subscription",
            },
            unit_amount: config.get<number>("premium.price") * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: user.email,
      success_url: `${config.get<string>("client_url")}/success`,
      cancel_url: `${config.get<string>("client_url")}/fail`,
      metadata: {
        user_id: user.id,
      },
    });
  }
  public async ticket_checkout({
    req,
    ticket,
    order,
    event,
    user,
  }: TicketCheckout): Promise<Stripe.Response<Stripe.Checkout.Session>> {
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
      success_url: `${req.get("origin")}/success`,
      cancel_url: `${req.get("origin")}/fail`,
      metadata: {
        order_id: order.id,
        user_id: user.id,
      },
    });
  }
}
