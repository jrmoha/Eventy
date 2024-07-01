import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import StatusCodes from "http-status-codes";
import { SearchInput } from "./search.validator";
import { queryString } from "../../lib/api.features";
import { SearchService } from "./search.service";

export const search = async_(
  async (
    req: Request<{}, {}, {}, SearchInput & queryString>,
    res: Response,
    next: NextFunction,
  ) => {
    const SearchServiceInstance = new SearchService();
    const events = await SearchServiceInstance.searchEvents(req);
    return res.status(StatusCodes.OK).json({ success: true, data: events });
  },
);
