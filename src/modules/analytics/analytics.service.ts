/* eslint-disable @typescript-eslint/no-explicit-any */
import { Op } from "sequelize";
import Post from "../post/post.model";
import Follow from "../follow/follow.model";
import Poll from "../poll/poll.model";
import Event from "../event/event.model";
import Like from "../like/like.model";
import Event_Interest from "../event/event.interest.model";
import Order from "../order/order.model";
import { sequelize } from "../../database";
import Ticket from "../event/event.tickets.model";

class AnalyticsService {
  private readonly organizer_id: number;
  private from_date: Date;
  private readonly to_date: Date;

  constructor(organizer_id: number, from_date: Date, to_date: Date) {
    this.organizer_id = organizer_id;
    this.from_date = from_date;
    this.to_date = to_date;
  }

  public async postsCount(): Promise<number> {
    return Post.count({
      where: {
        organizer_id: this.organizer_id,
        createdAt: {
          [Op.gte]: this.from_date,
          [Op.lte]: this.to_date,
        },
      },
      col: "id",
    });
  }
  public async newFollowersCount(): Promise<number> {
    return Follow.count({
      where: {
        followed_id: this.organizer_id,
        createdAt: {
          [Op.gte]: this.from_date,
          [Op.lte]: this.to_date,
        },
      },
      col: "followed_id",
    });
  }
  public async eventsCount(): Promise<number> {
    return Event.count({
      where: {
        createdAt: {
          [Op.gte]: this.from_date,
          [Op.lte]: this.to_date,
        },
      },
      include: [
        {
          model: Post,
          required: true,
          attributes: [],
          where: {
            organizer_id: this.organizer_id,
          },
        },
      ],
      col: "id",
    });
  }
  public async pollsCount(): Promise<number> {
    return Poll.count({
      where: {
        createdAt: {
          [Op.gte]: this.from_date,
          [Op.lte]: this.to_date,
        },
      },
      include: [
        {
          model: Post,
          where: {
            organizer_id: this.organizer_id,
          },
          required: true,
          attributes: [],
        },
      ],
      col: "id",
    });
  }
  public async likes(
    event_id: number,
  ): Promise<[number, Record<string, number>]> {
    return Like.findAndCountAll({
      where: {
        event_id,
        createdAt: {
          [Op.gte]: this.from_date,
          [Op.lte]: this.to_date,
        },
      },
      attributes: ["createdAt"],
    }).then((result) => {
      return [
        result.count,
        //reduce the result to get the count of likes per day
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.rows.reduce((acc: any, curr) => {
          const date = curr.createdAt.toISOString().split("T")[0];
          if (acc[date]) {
            acc[date] += 1;
          } else {
            acc[date] = 1;
          }
          return acc;
        }, {}),
      ];
    });
  }
  public async interests(
    event_id: number,
  ): Promise<[number, Record<string, number>]> {
    return Event_Interest.findAndCountAll({
      where: {
        event_id,
        createdAt: {
          [Op.gte]: this.from_date,
          [Op.lte]: this.to_date,
        },
      },
      attributes: ["createdAt"],
    }).then((result) => {
      return [
        result.count,
        //reduce the result to get the count of interests per day
        result.rows.reduce((acc: any, curr) => {
          const date = curr.createdAt.toISOString().split("T")[0];
          if (acc[date]) {
            acc[date] += 1;
          } else {
            acc[date] = 1;
          }
          return acc;
        }, {}),
      ];
    });
  }
  //   SELECT SUM(o.quantity) AS "Tickets Sold",SUM(o.total) AS "Total Paid" FROM orders o
  // INNER JOIN tickets t ON t.ticket_id = o.ticket_id
  // INNER JOIN events e ON e.id = t.event_id
  // INNER JOIN posts p ON p.id=e.id
  // WHERE p.organizer_id=1 AND o.status='success'
  public async AllTicketsSold(): Promise<[number, number]> {
    const data = Order.findAll({
      where: {
        status: "success",
        "$Ticket.Event.Post.organizer_id$": this.organizer_id,
        createdAt: {
          [Op.gte]: this.from_date,
          [Op.lte]: this.to_date,
        },
      },
      include: [
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
      ],
      attributes: [
        [sequelize.fn("SUM", sequelize.col("Order.quantity")), "total_sold"],
        [sequelize.fn("SUM", sequelize.col("Order.total")), "total_paid"],
      ],
      raw: true,
    });
    return data.then((result: any) => {
      return result.length > 0
        ? [result[0].total_sold, result[0].total_paid]
        : [0, 0];
    });
  }
  //   SELECT SUM(o.quantity) AS "Tickets Sold",SUM(o.total) AS "Total Paid" FROM orders o
  // INNER JOIN tickets t ON t.ticket_id = o.ticket_id
  // WHERE t.event_id = 74 AND o.status='success'
  public async EventSoldTickets(event_id: number): Promise<[number, number]> {
    const data = Order.findAll({
      where: {
        status: "success",
        "$Ticket.event_id$": event_id,
        createdAt: {
          [Op.gte]: this.from_date,
          [Op.lte]: this.to_date,
        },
      },
      include: [
        {
          model: Ticket,
          required: true,
          attributes: [],
        },
      ],
      attributes: [
        [sequelize.fn("SUM", sequelize.col("Order.quantity")), "total_sold"],
        [sequelize.fn("SUM", sequelize.col("Order.total")), "total_paid"],
      ],
      raw: true,
    });
    return data.then((result: any) => {
      return result.length > 0
        ? [result[0].total_sold, result[0].total_paid]
        : [0, 0];
    });
  }
}

export default AnalyticsService;
