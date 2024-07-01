import Stripe from "stripe";
import { IPaymentService } from "./IPaymentService.d";
import config from "config";
import { Request } from "express";
import Ticket from "../event/tickets/event.tickets.model";
import Event from "../event/event.model";
import Order from "../order/order.model";
import Person from "../person/person.model";

export type TicketCheckout = {
  req: Request;
  ticket: Ticket;
  order: Order;
  user: Person;
  event: Event;
};
export class OrderPaymentService implements IPaymentService {
  private readonly stripe: Stripe;
  private readonly key: string;

  constructor() {
    this.key = config.get<string>("stripe.secret_key");
    this.stripe = new Stripe(this.key);
  }

  public async payment_checkout({
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
            currency: "egp",
            product_data: {
              name: "Ticket for " + event.content,
            },
            unit_amount: ticket.price * 100,
          },
          quantity: order.quantity,
        },
        {
          price_data: {
            currency: "egp",
            product_data: {
              name: "Service Fee",
            },
            unit_amount: Number(ticket.price) * Number(order.quantity) * 2.5,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: user.email,
      success_url: `${config.get("client_url")}/success`,
      cancel_url: `${config.get("client_url")}/fail`,
      metadata: {
        order_id: order.id,
        user_id: user.id,
      },
    });
  }
}
