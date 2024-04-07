import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import SystemImage from "../image/system.image.model";
import config from "config";
import Image from "../image/image.model";
import { sequelize } from "../../database";
import { StatusCodes } from "http-status-codes";
import Organizer from "../organizer/organizer.model";
import UserImage from "../image/user.image.model";
import User from "../user/user.model";
import Person from "../person/person.model";
import Follow from "../follow/follow.model";
import { get_home_events, random_events } from "./feed.service";
import Event from "../event/event.model";

export const get_home = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const covers = await SystemImage.findAll({
      include: [{ model: Image, required: true, attributes: [] }],
      attributes: [[sequelize.col("Image.url"), "url"]],
      order: [["createdAt", "DESC"]],
      limit: config.get<number>("images.covers_max_length"),
    });

    const organizers = await User.findAll({
      include: [
        { model: Person, required: true, attributes: [] },
        {
          model: Organizer,
          required: true,
          attributes: [],
        },
        {
          model: UserImage,
          required: true,
          attributes: [],
          include: [
            {
              model: Image,
              required: true,
              attributes: [],
            },
          ],
          where: { is_profile: true },
        },
      ],
      attributes: [
        "id",
        "followers_count",
        [sequelize.col("Person.first_name"), "first_name"],
        [sequelize.col("Person.last_name"), "last_name"],
        [sequelize.col("Person.email"), "email"],
        [sequelize.col("Organizer.bio"), "bio"],
        [sequelize.col("Organizer.rate"), "rate"],
        [sequelize.col("Organizer.events_count"), "events_count"],
        [sequelize.col("UserImages.Image.url"), "image"],
      ],
      subQuery: false,
    });
    for (let i = 0; i < organizers.length; i++) {
      const organizer = organizers[i];
      if (!req.user) organizer.setDataValue("is_followed", false);
      else {
        const is_followed = await Follow.findOne({
          where: {
            follower_id: req.user?.id,
            followed_id: organizer.id,
          },
        });
        organizer.setDataValue("is_followed", is_followed ? true : false);
      }
    }

    let events: Event[];

    if (req.user) {
      // events = (await get_home_events(req)) as Event[];
      events = (await random_events()) as Event[];//TODO: change this
    } else {
      events = (await random_events()) as Event[];
    }

    return res
      .status(StatusCodes.OK)
      .json({ success: true, data: { covers, organizers, events } });
  },
);

export const get_feed = async_(
  async (req: Request, res: Response, next: NextFunction) => {},
);
