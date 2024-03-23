import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import Person from "../person/person.model";
import User from "../user/user.model";
import Organizer from "./organizer.model";
import UserImage from "../image/user.image.model";
import Image from "../image/image.model";
import { APIError } from "../../types/APIError.error";
import { StatusCodes } from "http-status-codes";
import { sequelize } from "../../database";
import Settings from "../settings/settings.model";
import { Literal } from "sequelize/types/utils";
import Event from "../event/event.model";
import EventImage from "../image/event.image.model";
import Post from "../post/post.model";
import { APIFeatures } from "../../utils/api.features";

export const profile = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    let literal!: [[Literal, string]];

    if (req.user?.id && req.user.id !== +id) {
      literal = [
        [
          sequelize.literal(
            `CASE WHEN EXISTS (SELECT 1 FROM follow WHERE follower_id = ${req.user.id} AND followed_id = ${id}) THEN true ELSE false END`,
          ),
          "is_following",
        ],
      ];
      literal.push([
        sequelize.literal(
          `CASE WHEN EXISTS (SELECT 1 FROM friendship WHERE (sender_id = ${req.user.id} AND receiver_id = ${id}) OR (sender_id = ${id} AND receiver_id = ${req.user.id})) THEN true ELSE false END`,
        ),
        "is_friend",
      ]);
    }

    const organizer = await Person.findByPk(id, {
      include: [
        {
          model: User,
          required: true,
          attributes: [],
          include: [
            {
              model: Organizer,
              required: true,
              attributes: [],
            },
            {
              model: UserImage,
              required: true,
              attributes: [],
              where: { is_profile: true },
              include: [
                {
                  model: Image,
                  required: true,
                  attributes: [],
                },
              ],
            },
          ],
        },
      ],
      attributes: [
        [
          sequelize.fn(
            "concat",
            sequelize.col("first_name"),
            " ",
            sequelize.col("last_name"),
          ),
          "full_name",
        ],
        "phone_number",
        "username",
        "id",
        "email",
        [sequelize.col("User.followers_count"), "followers_count"],
        [sequelize.col("User.following_count"), "following_count"],
        [sequelize.col("User.friends_count"), "friends_count"],
        [sequelize.col("User.Organizer.rate"), "rate"],
        [sequelize.col("User.Organizer.bio"), "bio"],
        [sequelize.col("User.Organizer.events_count"), "events_count"],
        [sequelize.col("User.UserImages.Image.url"), "profile_image"],
        ...(literal?.length ? literal : []),
      ],
    });

    if (!organizer)
      throw new APIError("Organizer not found", StatusCodes.NOT_FOUND);

    if (req.user?.id == +id) {
      organizer.setDataValue("followers_visible", true);
      organizer.setDataValue("following_visible", true);
      organizer.setDataValue("friends_visible", true);
      return res
        .status(StatusCodes.OK)
        .json({ success: true, data: organizer });
    }

    const settings = await Settings.findOne({
      where: { user_id: organizer.id },
    });

    switch (settings?.followers_visibility) {
      case "none":
        organizer.setDataValue("followers_visible", false);
        break;
      case "friends":
        organizer.setDataValue(
          "followers_visible",
          !!organizer.getDataValue("is_friend"),
        );
        break;
      case "anyone":
        organizer.setDataValue("followers_visible", true);
        break;
      default:
        break;
    }
    switch (settings?.following_visibility) {
      case "none":
        organizer.setDataValue("following_visible", false);
        break;
      case "friends":
        organizer.setDataValue(
          "following_visible",
          !!organizer.getDataValue("is_friend"),
        );
        break;
      case "anyone":
        organizer.setDataValue("following_visible", true);
        break;
      default:
        break;
    }
    switch (settings?.friends_visibility) {
      case "none":
        organizer.setDataValue("friends_visible", false);
        break;
      case "friends":
        organizer.setDataValue(
          "friends_visible",
          !!organizer.getDataValue("is_friend"),
        );
        break;
      case "anyone":
        organizer.setDataValue("friends_visible", true);
        break;
      default:
        break;
    }

    return res.status(StatusCodes.OK).json({ success: true, data: organizer });
  },
);

export const events = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const apifeatures = new APIFeatures(req.query).paginate();

    const events = await Post.findAll({
      where: { organizer_id: id, status: "published" },
      include: [
        {
          model: Event,
          required: true,
          attributes: [],
          include: [
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
        },
      ],
      attributes: [
        "id",
        "content",
        [sequelize.col("Event.date"), "date"],
        [sequelize.col("Event.location"), "location"],
        [sequelize.col("Event.time"), "time"],
        [sequelize.col("Event.EventImages.Image.url"), "image"],
      ],
      ...apifeatures.query,
      subQuery: false,
    });
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
