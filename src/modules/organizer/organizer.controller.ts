import { SettingsService } from "../user/settings/settings.service";
import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { APIError } from "../../error/api-error";
import { StatusCodes } from "http-status-codes";
import { APIFeatures } from "../../utils/api.features";
import { RedisService } from "../../cache";
import { CacheKeysGenerator } from "../../utils/cache_keys_generator";
import { OrganizerService } from "./organizer.service";

export const profile = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user_id = req.user?.id;

    const OrganizerServiceInstance = new OrganizerService();
    const organizer = await OrganizerServiceInstance.getOrganizerProfile(
      +id,
      user_id,
    );

    if (!organizer)
      throw new APIError("Organizer not found", StatusCodes.NOT_FOUND);

    const SettingsServiceInstance = new SettingsService();
    await SettingsServiceInstance.setSettings(organizer, req.user?.id);

    const redisClient = new RedisService();
    const key = new CacheKeysGenerator().keysGenerator["organizer"](req);
    await redisClient.set(key, organizer);

    return res.status(StatusCodes.OK).json({ success: true, data: organizer });
  },
);

export const events = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const apifeatures = new APIFeatures(req.query).paginate();

    const OrganizerServiceInstance = new OrganizerService();
    const events = await OrganizerServiceInstance.getOrganizerEvents(
      +id,
      apifeatures,
    );

    if (!events) throw new APIError("Events not found", StatusCodes.NOT_FOUND);

    const upcoming = events.filter((event) => {
      return new Date(event.dataValues.date) > new Date();
    });
    const past = events.filter((event) => {
      return new Date(event.dataValues.date) < new Date();
    });
    return res
      .status(StatusCodes.OK)
      .json({ success: true, data: { upcoming, past } });
  },
);
