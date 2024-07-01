import { Transaction } from "sequelize";
import Event from "../event.model";
import Ticket from "./event.tickets.model";
import { CreateEventInput } from "../event.validator";

export class TicketService {
  constructor() {}
  public async getTickets(event_id: number): Promise<Ticket[]> {
    return Ticket.findAll({
      where: {
        event_id,
      },
      attributes: ["ticket_id", "price", "class", "available"],
    });
  }
  public async saveTickets(
    tickets: CreateEventInput["tickets"],
    event: Event,
    t?: Transaction,
  ): Promise<Ticket[]> {
    return Ticket.bulkCreate(
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
