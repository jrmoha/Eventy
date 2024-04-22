import { FindAttributeOptions } from "sequelize";
import { sequelize } from "../../database";
import Event from "../event/event.model";
import Ticket from "../event/event.tickets.model";
import Person from "../person/person.model";
import Post from "../post/post.model";
import User from "../user/user.model";
import Order from "./order.model";

export class OrderService {
  constructor() {}
  public async orderDetails(order_id: string) {
    const attributes: FindAttributeOptions = [
      "status",
      [sequelize.col("Order.total"), "amount_paid"],
      [sequelize.col("Order.quantity"), "seats"],
      [sequelize.col("Ticket.class"), "ticket_class"],
      [
        sequelize.fn(
          "concat",
          sequelize.col("User.Person.first_name"),
          " ",
          sequelize.col("User.Person.last_name"),
        ),
        "full_name",
      ],
      [sequelize.col("Ticket.Event.Post.content"), "event"],
      [sequelize.col("Ticket.Event.date"), "event_date"],
      [
        sequelize.literal(
          `EXISTS (SELECT 1 FROM "event_attendance" WHERE "event_attendance"."user_id" = "Order"."user_id" AND "event_attendance"."event_id" = "Ticket"."event_id")`,
        ),
        "attended",
      ],
    ];
    const include = [
      {
        model: Ticket,
        required: true,
        attributes: [],
        include: [
          {
            model: Event,
            required: true,
            attributes: [],
            include: [
              {
                model: Post,
                required: true,
                attributes: [],
              },
            ],
          },
        ],
      },
      {
        model: User,
        required: true,
        attributes: [],
        include: [
          {
            model: Person,
            required: true,
            attributes: [],
          },
        ],
      },
    ];
    return Order.findOne({
      where: { id: order_id },
      include,
      attributes,
    });
  }
}
