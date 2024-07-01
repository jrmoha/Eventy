import { Transaction } from "sequelize";
import Rate from "./rate.model";
import Organizer from "../organizer/organizer.model";

export class RateService {
  constructor() {}
  public async rateExists(user_id: number, event_id: number): Promise<boolean> {
    return !!(await Rate.findOne({ where: { user_id, event_id } }));
  }
  public async createRate(
    user_id: number,
    event_id: number,
    rate: number,
    review: string,
    t?: Transaction,
  ): Promise<Rate> {
    return Rate.create(
      {
        user_id,
        event_id,
        rate,
        review,
      },
      { transaction: t },
    );
  }
  public async calculateOrganizerRate(
    organizer: Organizer,
    rate: number,
    t?: Transaction,
  ): Promise<void> {
    const new_organizer_rate =
      organizer.rates_count === 0
        ? rate
        : (organizer.rate * organizer.rates_count + rate) /
          (organizer.rates_count + 1);
    organizer.rate = Math.round(new_organizer_rate * 2) / 2;
    organizer.rates_count++;
    await organizer.save({ transaction: t });
  }
}
