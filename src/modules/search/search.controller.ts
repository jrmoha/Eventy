import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { sequelize } from "../../database";
import StatusCodes from "http-status-codes";
import Event from "../event/event.model";
import { SearchInput } from "./search.validator";
import QueryBuilder from "./queryBuilder";
import { FindAttributeOptions } from "sequelize";

export const search = async_(
  async (
    req: Request<{}, {}, {}, SearchInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const queryBuilder = new QueryBuilder(req.query, req.user?.id).build();

    const attributes: FindAttributeOptions = [
      "id",
      "location",
      "date",
      "time",
      "likes_count",
      [
        sequelize.literal(
          `ts_rank(search, websearch_to_tsquery('english', :query))`,
        ),
        "rank",
      ],
    ];

    console.log(queryBuilder._where);
    const events = await Event.findAll({
      where: queryBuilder._where,
      include: queryBuilder._includes,
      attributes,
      order: sequelize.literal("rank DESC"),
      replacements: { query: req.query.q, user_id: req.user?.id },
      benchmark: true,
      logging: console.log,
      subQuery: false,
    });

    return res.status(StatusCodes.OK).json({ success: true, data: events });
  },
);
