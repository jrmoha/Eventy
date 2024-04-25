import { NextFunction, Request, Response } from "express";
import { async_ } from "../../../interfaces/middleware/async.middleware";
import Settings from "./settings.model";
import { APIError } from "../../../error/api-error";
import { StatusCodes } from "http-status-codes";
import { EditSettingsInput } from "./settings.validator";
import { SettingsService } from "./settings.service";

export const get_settings = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user?.id;

    const SettingsServiceInstance = new SettingsService();
    const settings = await SettingsServiceInstance.getSettings(user_id);

    if (!settings)
      throw new APIError("Settings not found", StatusCodes.NOT_FOUND);

    return res.status(StatusCodes.OK).json({ success: true, data: settings });
  },
);

export const edit_settings = async_(
  async (
    req: Request<{}, {}, EditSettingsInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const {
      allow_marketing_emails,
      allow_reminders,
      friends_visibility,
      followers_visibility,
      following_visibility,
    } = req.body;

    const settings = await Settings.findOne({
      where: { user_id },
    });

    if (!settings)
      throw new APIError("Settings not found", StatusCodes.NOT_FOUND);
    //set allow_marketing_emails to settings.allow_marketing_emails if allow_marketing_emails is not provided
    allow_marketing_emails != undefined &&
      (settings.allow_marketing_emails = allow_marketing_emails);
    //set allow_reminders to settings.allow_reminders if allow_reminders is not provided
    allow_reminders != undefined &&
      (settings.allow_reminders = allow_reminders);
    //set friends_visibility to settings.friends_visibility if friends_visibility is not provided
    friends_visibility && (settings.friends_visibility = friends_visibility);
    //set followers_visibility to settings.followers_visibility if followers_visibility is not provided
    followers_visibility &&
      (settings.followers_visibility = followers_visibility);
    //set following_visibility to settings.following_visibility if following_visibility is not provided
    following_visibility &&
      (settings.following_visibility = following_visibility);

    if (!settings.changed())
      throw new APIError("No changes made", StatusCodes.BAD_REQUEST);

    await settings.save();

    return res.status(StatusCodes.OK).json({ success: true, data: settings });
  },
);
