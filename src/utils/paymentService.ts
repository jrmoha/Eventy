import config from "config";
import Stripe from "stripe";
import Ticket from "../modules/event/event.tickets.model";
import Order from "../modules/order/order.model";
import Event from "../modules/event/event.model";
import Person from "../modules/person/person.model";

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
}
