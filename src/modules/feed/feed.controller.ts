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
import Event from "../event/event.model";
import EventImage from "../image/event.image.model";
import Post from "../post/post.model";

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

    const events = await Event.findAll({
      include: [
        {
          model: Post,
          required: true,
          attributes: [],
          include: [
            {
              model: Organizer,
              required: true,
              attributes: [],
              include: [
                {
                  model: User,
                  required: true,
                  attributes: [],
                  include: [
                    {
                      model: Person,
                      required: true,
                      attributes: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      attributes: [
        "id",
        "location",
        "date",
        "time",
        [sequelize.col("Post.content"), "content"],
        [sequelize.col("Post.status"), "status"],
        [sequelize.col("Post.Organizer.rate"), "rate"],
        [
          sequelize.fn(
            "concat",
            sequelize.col("Post.Organizer.User.Person.first_name"),
            " ",
            sequelize.col("Post.Organizer.User.Person.last_name"),
          ),
          "organizer_name",
        ],
        [
          sequelize.col("Post.Organizer.User.followers_count"),
          "followers_count",
        ],
      ],
      where: {
        "$Post.status$": "published",
      },
      order: sequelize.random(),
      limit: 20,
    });
    
    const promises = events.map(async (event) => {
      const image = await EventImage.findOne({
        where: { event_id: event.id },
        include: [
          {
            model: Image,
            required: true,
            attributes: [],
          },
        ],
        attributes: [[sequelize.col("Image.url"), "url"]],
        order: [["createdAt", "DESC"]],
      });
      event.setDataValue("image", image?.dataValues.url);
      event.setDataValue("date", event.date.toDateString());
    });

    await Promise.all(promises);

    return res
      .status(StatusCodes.OK)
      .json({ success: true, data: { covers, organizers, events } });
  },
);

export const get_feed = async_(
  async (req: Request, res: Response, next: NextFunction) => {},
);
