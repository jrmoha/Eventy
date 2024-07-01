import Stripe from "stripe";
import { IPaymentService } from "./IPaymentService.d";
import config from "config";
import { Request } from "express";
import Person from "../person/person.model";
export type PremiumCheckout = {
  req: Request;
  user: Person;
};
export class PremiumPaymentService implements IPaymentService {
  private readonly stripe: Stripe;
  private readonly key: string;

  constructor() {
    this.key = config.get<string>("stripe.premium_secret_key");
    this.stripe = new Stripe(this.key);
  }
  public async payment_checkout({
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
}
