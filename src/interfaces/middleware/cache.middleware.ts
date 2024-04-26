import { NextFunction, Request, Response } from "express";
import StatusCodes from "http-status-codes";
import { RedisService } from "../../cache";
import { async_ } from "./async.middleware";
import { CacheKeysGenerator } from "../../utils/cache_keys_generator";
import { ResourceType } from "../../types/cache.type";

export const cache = (resource: ResourceType) => {
  return async_(async (req: Request, res: Response, next: NextFunction) => {
    const keysGenerator = new CacheKeysGenerator().keysGenerator;
    const key = keysGenerator[resource](req);
    const client = new RedisService().Client;

    const cached = await client?.get(key);
    if (cached) {
      const data = JSON.parse(cached);

      return res
        .status(StatusCodes.OK)
        .json({ success: true, data, cached: true });
    }
    return next();
  });
};
