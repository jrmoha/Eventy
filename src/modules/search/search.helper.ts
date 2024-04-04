import { Includeable, Op } from "sequelize";
import { SearchInput } from "./search.validator";
import { sequelize } from "../../database";
import EventCategory from "../category/event.category.model";
import Ticket from "../event/event.tickets.model";

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
class QueryBuilder {
  private readonly query: SearchInput;
  private readonly where: IWhere;
  private readonly includes: Includeable[] = [];

  constructor(query: SearchInput) {
    this.query = query;
    this.where = {};
  }

  build() {
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

    return this;
  }

  get _includes() {
    return this.includes;
  }

  get _where() {
    return this.where;
  }
}

export default QueryBuilder;
