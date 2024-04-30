import { FindOptions } from "sequelize/types";

export type queryString = {
  page?: number;
  limit?: number;
  sort?: string;
  // filter?: string;
  // search?: string;
  // select?: string;
};

export class APIFeatures {
  query: FindOptions;
  queryString: queryString;

  constructor(queryString: queryString = {}) {
    this.query = {};
    this.queryString = queryString;
  }

  paginate() {
    const page = this.queryString.page || 1;
    const limit = this.queryString.limit || 10;
    const skip = (page - 1) * limit;
    this.query.offset = skip;
    this.query.limit = limit;
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").map((el) => {
        if (el.startsWith("-")) {
          return [el.slice(1), "DESC"];
        }
        return [el, "ASC"];
      });
      this.query.order = sortBy as [string, "ASC" | "DESC"][];
    }
    return this;
  }
}
