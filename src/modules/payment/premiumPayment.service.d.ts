import { Request } from "express";
import Stripe from "stripe";
import Person from "../person/person.model";

export type PremiumCheckout = {
  req: Request;
  user: Person;
};

interface IPremiumPaymentService {
  premium_checkout({
    req,
    user,
  }: PremiumCheckout): Promise<Stripe.Response<Stripe.Checkout.Session>>;
}
