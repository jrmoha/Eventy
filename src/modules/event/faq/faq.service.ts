import { Transaction } from "sequelize";
import Event from "../event.model";
import { CreateEventInput } from "../event.validator";
import EventFAQ from "./faq.model";

export class FAQService {
  constructor() {}
  public async insertFAQs(
    faqs: CreateEventInput["faqs"],
    event: Event,
    t?: Transaction,
  ): Promise<EventFAQ[]> {
    return EventFAQ.bulkCreate(
      faqs?.map((faq) => ({
        event_id: event.id,
        question: faq.question,
        answer: faq.answer,
      })),
      { transaction: t },
    );
  }
}
