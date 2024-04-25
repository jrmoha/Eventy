import { Transaction } from "sequelize";
import { CreateEventInput } from "../event.validator";
import Event_Agenda from "./agenda.model";
import Event from "../event.model";

export class AgendaService {
  constructor() {}
  public async insertAgenda(
    event: Event,
    agenda: CreateEventInput["agenda"],
    t: Transaction,
  ) {
    return Event_Agenda.bulkCreate(
      agenda.map((agenda) => ({
        event_id: event.id,
        description: agenda.description,
        start_time: agenda.start_time,
        end_time: agenda.end_time,
      })),
      { transaction: t },
    );
  }
}
