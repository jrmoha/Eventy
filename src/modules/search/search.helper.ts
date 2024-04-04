import { Op } from "sequelize";
import { SearchInput } from "./search.validator";
import { sequelize } from "../../database";

interface IWhere {
  [key: string]: {
    [op: string]: unknown;
  };
}
class QueryBuilder {
  private readonly query: SearchInput;
  private readonly where: IWhere;
  //   private readonly includes: Includeable[] = [];

  constructor(query: SearchInput) {
    this.query = query;
    this.where = {};
  }

  build() {
    const { q, location } = this.query;

    this.where["search"] = {
      [Op.match]: sequelize.fn("websearch_to_tsquery", "english", q),
    };

    if (location) {
      this.where["location"] = {
        [Op.iLike]: `%${location}%`,
      };
    }

    return this.where;
  }
}

export default QueryBuilder;
