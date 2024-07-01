import { FindAttributeOptions, Includeable, Op } from "sequelize";
import { SearchInput } from "../modules/search/search.validator";
import { sequelize } from "../database";
import EventCategory from "../modules/event/category/event.category.model";
import Ticket from "../modules/event/tickets/event.tickets.model";
import Post from "../modules/post/post.model";
import { Literal } from "sequelize/types/utils";

interface IWhere {
  [key: string]: {
    [op: string]: unknown;
  };
}
const dateOperators = {
  today: {
    [Op.gte]: new Date(),
    [Op.lt]: new Date(new Date().setDate(new Date().getDate() + 1)),
  },
  tomorrow: {
    [Op.gte]: new Date(new Date().setDate(new Date().getDate() + 1)),
    [Op.lt]: new Date(new Date().setDate(new Date().getDate() + 2)),
  },
  "this-week": {
    [Op.gte]: new Date(),
    [Op.lt]: new Date(new Date().setDate(new Date().getDate() + 7)),
  },
  "next-week": {
    [Op.gte]: new Date(new Date().setDate(new Date().getDate() + 7)),
    [Op.lt]: new Date(new Date().setDate(new Date().getDate() + 14)),
  },
  "this-month": {
    [Op.gte]: new Date(),
    [Op.lt]: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  },
  "next-month": {
    [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    [Op.lt]: new Date(new Date().setMonth(new Date().getMonth() + 2)),
  },
};
export default class QueryBuilder {
  private readonly query: SearchInput;
  private readonly user_id?: number;
  private readonly where: IWhere;
  private readonly includes: Includeable[];
  private attributes: FindAttributeOptions;

  constructor(query: SearchInput, user_id?: number) {
    this.query = query;
    this.user_id = user_id;
    this.where = {};
    this.includes = [];
    this.attributes = [];
  }

  public build() {
    this.buildWhere();
    this.buildAttributes();
    return this;
  }
  private buildWhere(): void {
    const {
      q,
      location,
      date,
      from_date,
      to_date,
      category,
      price,
      min_price,
      max_price,
      only_from_following,
    } = this.query;

    this.where["search"] = {
      [Op.match]: sequelize.fn("websearch_to_tsquery", "english", q),
    };

    if (location) {
      this.where["location"] = {
        [Op.iLike]: `%${location}%`,
      };
    }
    if (date) {
      const key = date as keyof typeof dateOperators;
      if (!dateOperators[key]) {
        this.where["date"] = {
          [Op.gte]: new Date(date),
        };
      } else {
        this.where["date"] = dateOperators[key];
      }
    } else if (from_date && to_date) {
      this.where["date"] = {
        [Op.gte]: new Date(from_date),
        [Op.lte]: new Date(to_date),
      };
    }

    if (category) {
      this.includes.push({
        model: EventCategory,
        where: {
          category: {
            [Op.iLike]: `%${category}%`,
          },
        },
        required: true,
        attributes: [],
      });
    }
    if (price) {
      if (price === "free") {
        this.includes.push({
          model: Ticket,
          where: {
            price: 0,
          },
          required: true,
          attributes: [],
        });
      } else {
        this.includes.push({
          model: Ticket,
          where: {
            price: {
              [Op.gt]: 0,
            },
          },
          required: true,
          attributes: [],
        });
      }
    } else if (min_price && max_price) {
      this.includes.push({
        model: Ticket,
        where: {
          price: {
            [Op.between]: [min_price, max_price],
          },
        },
        required: true,
        attributes: [],
      });
    }
    if (only_from_following && this.user_id) {
      this.includes.push({
        model: Post,
        attributes: [],
        where: {
          status: "published",
          organizer_id: {
            [Op.in]: sequelize.literal(
              `(SELECT followed_id FROM "follow" WHERE follower_id = :user_id)`,
            ),
          },
        },
        required: true,
      });
    } else {
      this.includes.push({
        model: Post,
        attributes: [],
        where: {
          status: "published",
        },
        required: true,
      });
    }
  }
  private buildAttributes() {
    let literal!: [[Literal, string]];
    if (this.user_id) {
      literal = [
        [
          sequelize.literal(`EXISTS (
            SELECT 1
            FROM likes
            WHERE likes.event_id = "Event".id
            AND likes.user_id = :user_id
          )`),
          "is_liked",
        ],
      ];
      literal.push([
        sequelize.literal(`EXISTS (
            SELECT 1
            FROM event_interest
            WHERE event_interest.event_id = "Event".id
            AND event_interest.user_id = :user_id
          )`),
        "is_interested",
      ]);
    }
    this.attributes = [
      "id",
      "location",
      [
        sequelize.literal(
          `CASE
            WHEN date = CURRENT_DATE THEN 'Today'
            WHEN date = CURRENT_DATE + INTERVAL '1 day' THEN 'Tomorrow'
            ELSE date::text
          END`,
        ),
        "date",
      ],
      "time",
      "likes_count",
      [
        sequelize.literal(
          `ts_rank(search, websearch_to_tsquery('english', :query))`,
        ),
        "rank",
      ],
      [sequelize.col("EventImages.Image.secure_url"), "image"],
      [sequelize.col("Post.content"), "content"],
      ...(literal ? literal : []),
    ];
  }
  /**
   * @description Get includes for the query
   * @returns {Includeable[]} includes
   */
  get _includes(): Includeable[] {
    return this.includes;
  }
  /**
   * @description Get where for the query
   * @returns {IWhere} where
   */
  get _where(): IWhere {
    return this.where;
  }
  /**
   * @description Get attributes for the query
   * @returns {FindAttributeOptions} attributes
   *
   */
  get _attributes(): FindAttributeOptions {
    return this.attributes;
  }
}
