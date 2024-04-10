import { Op } from "sequelize";
import Post from "../post/post.model";
import Follow from "../follow/follow.model";
import Poll from "../poll/poll.model";
import Event from "../event/event.model";
import Like from "../like/like.model";
import Event_Interest from "../event/event.interest.model";

class AnalyticsService {
  private readonly from_date: Date;
  private readonly to_date: Date;

  constructor(from_date?: string, to_date?: string) {
    this.from_date = from_date
      ? new Date(from_date)
      : new Date(new Date().setDate(new Date().getDate() - 7));
    this.to_date = to_date ? new Date(to_date) : new Date();
  }
  public async postsCount(organizer_id: number): Promise<number> {
    return Post.count({
      where: {
        organizer_id,
        createdAt: {
          [Op.gte]: this.from_date,
          [Op.lte]: this.to_date,
        },
      },
      col: "id",
    });
  }
  public async newFollowersCount(organizer_id: number): Promise<number> {
    return Follow.count({
      where: {
        followed_id: organizer_id,
        createdAt: {
          [Op.gte]: this.from_date,
          [Op.lte]: this.to_date,
        },
      },
      col: "followed_id",
    });
  }
  public async eventsCount(organizer_id: number): Promise<number> {
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
            organizer_id,
          },
        },
      ],
      col: "id",
    });
  }
  public async pollsCount(organizer_id: number): Promise<number> {
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
            organizer_id,
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
}

export default AnalyticsService;
