import config from "config";
import { Op } from "sequelize";
import PremiumUser from "./premium.model";
import Stripe from "stripe";
import { Request } from "express";
import User from "../user/user.model";
import { APIError } from "../../error/api-error";
import { StatusCodes } from "http-status-codes";
import { sequelize } from "../../database";
import Payment from "../payment/payment.model";

export class PremiumService {
  constructor() {}
  public async isPremium(user_id: number): Promise<boolean> {
    return !!(await PremiumUser.findOne({
      where: {
        user_id,
        end_date: {
          [Op.gte]: new Date(),
        },
      },
    }));
  }
  public async handlePremiumSuccess(
    checkoutSessionAsyncPaymentSucceeded: Stripe.Checkout.Session,
    req: Request,
  ): Promise<void> | never {
    const user_id = checkoutSessionAsyncPaymentSucceeded?.metadata?.user_id;
    const user = await User.findByPk(user_id);
    if (!user) throw new APIError("User not found", StatusCodes.NOT_FOUND);

    const payment_transaction_id =
      checkoutSessionAsyncPaymentSucceeded?.payment_intent;

    const t = await sequelize.transaction();

    const payment = await Payment.create(
      {
        id: payment_transaction_id,
        amount: checkoutSessionAsyncPaymentSucceeded.amount_total,
        status: "success",
        payment_method: "stripe",
        payment_type: "event",
        user_id,
        ip: req.ip,
      },
      { transaction: t },
    );

    await PremiumUser.create(
      {
        user_id,
        payment_id: payment.id,
        end_date: this.premium_end_date(),
        can_remove_ads: true,
        can_allow_waiting_list: false,
      },
      { transaction: t },
    );

    await t.commit();
  }
  public async handlePremiumFailure(
    checkoutSessionAsyncPaymentFailed: Stripe.Checkout.Session,
    req: Request,
  ): Promise<void> | never {
    const user_id = checkoutSessionAsyncPaymentFailed?.metadata?.user_id;
    const user = await User.findByPk(user_id);
    if (!user) throw new APIError("User not found", StatusCodes.NOT_FOUND);

    const transaction_id = checkoutSessionAsyncPaymentFailed?.payment_intent;

    await Payment.create({
      id: transaction_id,
      amount: checkoutSessionAsyncPaymentFailed.amount_total,
      status: "failed",
      payment_method: "stripe",
      payment_type: "event",
      user_id: user_id,
      ip: req.ip,
    });
  }
  private premium_end_date(): Date {
    const days = config.get<number>("premium.duration");
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
}
