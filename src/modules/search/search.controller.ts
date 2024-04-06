import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { sequelize } from "../../database";
import StatusCodes from "http-status-codes";
import Event from "../event/event.model";
import { SearchInput } from "./search.validator";
import QueryBuilder from "./queryBuilder";
import EventImage from "../image/event.image.model";
import Image from "../image/image.model";
import { APIFeatures, queryString } from "../../utils/api.features";

export const search = async_(
  async (
    req: Request<{}, {}, {}, SearchInput & queryString>,
    res: Response,
    next: NextFunction,
  ) => {
    const queryBuilder = new QueryBuilder(req.query, req.user?.id).build();
    const apifeatures = new APIFeatures(req.query).paginate();

    const events = await Event.findAll({
      where: queryBuilder._where,
      include: [
        ...queryBuilder._includes,
        {
          model: EventImage,
          required: true,
          attributes: [],
          include: [
            {
              model: Image,
              required: true,
              attributes: [],
            },
          ],
        },
      ],
      attributes: queryBuilder._attributes,
      order: sequelize.literal("rank DESC"),
      replacements: { query: req.query.q, user_id: req.user?.id },
      ...apifeatures.query,
      benchmark: true,
      logging: console.log,
      subQuery: false,
    });

    return res.status(StatusCodes.OK).json({ success: true, data: events });
  },
);
