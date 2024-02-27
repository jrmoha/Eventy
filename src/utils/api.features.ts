import { FindOptions } from "sequelize/types";

type queryString = {
  page?: number;
  limit?: number;
  sort?: string;
  // filter?: string;
  //   search?: string;
  select?: string;
};

export class APIFeatures {
  query: FindOptions;
  queryObject: queryString;

  constructor(queryObject: queryString = {}) {
    this.query = {};
    this.queryObject = queryObject;
  }

  paginate() {
    const page = this.queryObject.page || 1;
    const limit = this.queryObject.limit || 10;
    const skip = (page - 1) * limit;
    this.query.offset = skip;
    this.query.limit = limit;
    return this;
  }

  sort() {
    if (this.queryObject.sort) {
      const sortBy = this.queryObject.sort.split(",").map((el) => {
        if (el.startsWith("-")) {
          return [el.slice(1), "DESC"];
        }
        return [el, "ASC"];
      });
      this.query.order = sortBy as [string, "ASC" | "DESC"][];
    }
    return this;
  }

  filter() {
    // if (this.queryObject.filter) {
    // }
    return this;
  }

  select() {
    const selectFields = this.queryObject.select;
    if (selectFields) {
      const fields = selectFields.split(",");
      this.query.attributes = fields;
    }
    return this;
  }
}
