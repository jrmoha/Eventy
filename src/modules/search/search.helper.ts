import { Op } from "sequelize";
import { SearchInput } from "./search.validator";
import { sequelize } from "../../database";

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
  //   private readonly includes: Includeable[] = [];

  constructor(query: SearchInput) {
    this.query = query;
    this.where = {};
  }

  build() {
    const { q, location, date } = this.query;

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
    } else if (this.query.from_date && this.query.to_date) {
      this.where["date"] = {
        [Op.gte]: new Date(this.query.from_date),
        [Op.lte]: new Date(this.query.to_date),
      };
    }

    return this.where;
  }
}

export default QueryBuilder;
