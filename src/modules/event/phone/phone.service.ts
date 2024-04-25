import { Transaction } from "sequelize";
import Event from "../event.model";
import { CreateEventInput } from "../event.validator";
import Event_Phone from "./phone.model";

export class EventPhoneService {
  constructor() {}
  public async insertPhoneNumbers(
    event: Event,
    phone_numbers: CreateEventInput["phone_numbers"],
    t: Transaction,
  ) {
    const phone_numbers_set = new Set(
      Array.isArray(phone_numbers) ? phone_numbers : [],
    );
    return Event_Phone.bulkCreate(
      [...phone_numbers_set].map((phone: string) => ({
        event_id: event.id,
        phone,
      })),
      { transaction: t },
    );
  }
}
