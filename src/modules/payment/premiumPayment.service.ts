import Stripe from "stripe";
import {
  IPremiumPaymentService,
  PremiumCheckout,
} from "./premiumPayment.service.d";
import config from "config";

export class PremiumPaymentService implements IPremiumPaymentService {
  private readonly stripe: Stripe;
  private readonly key: string;

  constructor() {
    this.key = config.get<string>("stripe.premium_secret_key");
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
}
