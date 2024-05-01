import { Request } from "express";
import Stripe from "stripe";
import Person from "../person/person.model";
import Ticket from "../event/tickets/event.tickets.model";
import Order from "../order/order.model";
import Event from "../event/event.model";

export type TicketCheckout = {
  req: Request;
  ticket: Ticket;
  order: Order;
  user: Person;
  event: Event;
};
export interface IOrderPaymentService {
  ticket_checkout({
    req,
    ticket,
    order,
    event,
    user,
  }: TicketCheckout): Promise<Stripe.Response<Stripe.Checkout.Session>>;
}
