import { Transaction } from "sequelize";
import Event from "../event.model";
import Ticket from "./event.tickets.model";
import { CreateEventInput } from "../event.validator";

export class TicketService {
  constructor() {}
  public async saveTickets(
    tickets: CreateEventInput["tickets"],
    event: Event,
    t?: Transaction,
  ) {
    Ticket.bulkCreate(
      tickets.map((ticket) => ({
        event_id: event.id,
        price: ticket.price,
        class: ticket.class,
        quantity: ticket.quantity,
        available: ticket.available,
      })),
      { transaction: t },
    );
  }
}
