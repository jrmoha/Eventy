import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { sequelize } from "../../database";
import StatusCodes from "http-status-codes";
import Event from "../event/event.model";
import { SearchInput } from "./search.validator";
import QueryBuilder from "./search.helper";

export const search = async_(
  async (
    req: Request<{}, {}, {}, SearchInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const queryBuilder = new QueryBuilder(req.query).build();

    const events = await Event.findAll({
      where: queryBuilder._where,

      include: [...queryBuilder._includes],
      attributes: [
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
      ],
      order: sequelize.literal("rank DESC"),
      replacements: { query: req.query.q },
      benchmark: true,
      logging: console.log,
    });

    return res.status(StatusCodes.OK).json({ success: true, data: events });
  },
);
