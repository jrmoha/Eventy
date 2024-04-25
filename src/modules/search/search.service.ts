import { Request } from "express";
import { APIFeatures, queryString } from "../../utils/api.features";
import QueryBuilder from "../../utils/query_builder";
import Event from "../event/event.model";
import EventImage from "../event/image/event.image.model";
import { SearchInput } from "./search.validator";
import { sequelize } from "../../database";
import Image from "../image/image.model";

export class SearchService {
  constructor() {}
  public async searchEvents(
    req: Request<{}, {}, {}, SearchInput & queryString>,
  ): Promise<Event[]> {
    const queryBuilder = new QueryBuilder(req.query, req.user?.id).build();
    const apifeatures = new APIFeatures(req.query).paginate();

    return Event.findAll({
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
  }
}
