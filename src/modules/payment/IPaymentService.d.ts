import { TicketCheckout } from "./orderPayment.service";
import { PremiumCheckout } from "./premiumPayment.service";

export interface IPaymentService {
  payment_checkout({
    req,
    ticket,
    order,
    event,
    user,
  }: PremiumCheckout | TicketCheckout): Promise<
    Stripe.Response<Stripe.Checkout.Session>
  >;
}
