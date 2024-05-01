import { PremiumService } from "./premium.service";
import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { APIError } from "../../error/api-error";
import { StatusCodes } from "http-status-codes";
import { PremiumPaymentService } from "../payment/premiumPayment.service";
import Person from "../person/person.model";
import logger from "../../log/logger";
import config from "config";
import Stripe from "stripe";

export const becomePremium = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user?.id;
    if (!user_id) return;
    // Check if user is already premium
    const PremiumServiceInstance = new PremiumService();
    const isPremium = await PremiumServiceInstance.isPremium(user_id);
    if (isPremium)
      throw new APIError("User is already premium", StatusCodes.BAD_REQUEST);

    // Create payment
    const paymentServiceInstance = new PremiumPaymentService();
    const checkoutSession = await paymentServiceInstance.premium_checkout({
      req,
      user: req.user as Person,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      redirect_url: checkoutSession.url,
    });
  },
);

export const webhook = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers["stripe-signature"];

    if (!sig) throw new APIError("No signature", StatusCodes.BAD_REQUEST);

    const endpointSecret = config.get<string>("stripe.premium_endpoint_secret");
    const stripeWebhookEvent = Stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret,
    );

    if (!stripeWebhookEvent)
      throw new APIError("Invalid signature", StatusCodes.BAD_REQUEST);

    const PremiumServiceInstance = new PremiumService();

    // Handle the event
    switch (stripeWebhookEvent.type) {
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
        await PremiumServiceInstance.handlePremiumFailure(
          stripeWebhookEvent.data.object,
          req,
        );
        break;
      case "checkout.session.async_payment_succeeded":
      case "checkout.session.completed":
        await PremiumServiceInstance.handlePremiumSuccess(
          stripeWebhookEvent.data.object,
          req,
        );
        break;
      default:
        logger.error(`Unhandled event type ${stripeWebhookEvent.type}`);
    }

    return res.status(StatusCodes.OK).send(); // Return a 200 response to acknowledge receipt of the event
  },
);
