import Stripe from "stripe";
import { IOrderPaymentService, TicketCheckout } from "./orderPayment.service.d";
import config from "config";

export class OrderPaymentService implements IOrderPaymentService {
  private readonly stripe: Stripe;
  private readonly key: string;

  constructor() {
    this.key = config.get<string>("stripe.secret_key");
    this.stripe = new Stripe(this.key);
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
      success_url: `${config.get("client_url")}/success`,
      cancel_url: `${config.get("client_url")}/fail`,
      metadata: {
        order_id: order.id,
        user_id: user.id,
      },
    });
  }
}
