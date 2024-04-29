import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { StatusCodes } from "http-status-codes";
import { FeedService } from "./feed.service";
import Event from "../event/event.model";
import { RedisService } from "../../cache";
import { CacheKeysGenerator } from "../../utils/cache_keys_generator";

export const get_home = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const FeedServiceInstance = new FeedService();

    const covers = await FeedServiceInstance.get_home_covers();
    const organizers = await FeedServiceInstance.get_home_organizers(req);
    const events: Event[] = await FeedServiceInstance.get_feed_events(req);


    const data = { covers, organizers, events };

    const redisClient = new RedisService();
    const key = new CacheKeysGenerator().keysGenerator["feed"](req);
    await redisClient.set(key, data);

    return res.status(StatusCodes.OK).json({ success: true, data });
  },
);

 