import config from "config";
import { NextFunction, Request, Response } from "express";
import StatusCodes from "http-status-codes";
import { async_ } from "../../interfaces/middleware/async.middleware";
import cloudinary from "../../utils/cloudinary";
import Image from "../image/image.model";
import fs from "fs";
import UserImage from "../image/user.image.model";
import Person from "../person/person.model";
import { APIError } from "../../types/APIError.error";
import { ChangePasswordInput, UpdateUserInput } from "./user.validator";
import { sequelize } from "../../database";
import User from "./user.model";
import Organizer from "../organizer/organizer.model";
import Follow from "../follow/follow.model";
import Friendship from "../friendship/friendship.model";
import { Op } from "sequelize";
import { APIFeatures } from "../../utils/api.features";
import Like from "../like/like.model";
import Event from "../event/event.model";
import Post from "../post/post.model";
import EventImage from "../image/event.image.model";
import { Literal } from "sequelize/types/utils";
import Event_Interest from "../event/event.interest.model";
import bcrypt from "bcryptjs";

export const update = async_(
  async (
    req: Request<{}, {}, UpdateUserInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const {
      first_name,
      last_name,
      username,
      email,
      phone_number,
      gender,
      birthdate,
    } = req.body;

    const person = (await Person.findByPk(user_id, {
      attributes: { exclude: ["password"] },
    })) as Person;
    first_name && (person.first_name = first_name);
    last_name && (person.last_name = last_name);
    gender && (person.gender = gender);
    birthdate && (person.birthdate = new Date(birthdate));

    if (username && username !== person.username) {
      {
        const username_exists = await Person.findOne({
          where: { username },
        });

        if (username_exists) {
          throw new APIError("Username already exists", StatusCodes.CONFLICT);
        }

        person.username = username;
      }
    }
    if (email && email !== person.email) {
      const email_exists = await Person.findOne({
        where: { email },
      });

      if (email_exists) {
        throw new APIError("Email already exists", StatusCodes.CONFLICT);
      }

      person.email = email;
    }
    if (phone_number && phone_number !== person.phone_number) {
      const phone_number_exists = await Person.findOne({
        where: { phone_number },
      });

      if (phone_number_exists) {
        throw new APIError("Phone number already exists", StatusCodes.CONFLICT);
      }

      person.phone_number = phone_number;
    }

    if (!person.changed())
      throw new APIError("No changes detected", StatusCodes.BAD_REQUEST);

    await person.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      data: person,
    });
  },
);
export const change_password = async_(
  async (
    req: Request<{}, {}, ChangePasswordInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const { old_password, new_password } = req.body;

    const user = await Person.findByPk(user_id);
    if (!user) throw new APIError("User not found", StatusCodes.NOT_FOUND);

    const isMatch = await bcrypt.compare(old_password, user.password as string);

    if (!isMatch)
      throw new APIError("Invalid password", StatusCodes.UNAUTHORIZED);

    user.password = await bcrypt.hash(
      new_password,
      +config.get<string>("bcrypt.SALT_ROUNDS"),
    );

    await user.save();

    return res.status(StatusCodes.OK).json({ success: true });
  },
);
export const uploadImage = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user?.id;
    const file = req.file as Express.Multer.File;

    const { public_id, url, secure_url, format } =
      await cloudinary.uploader.upload(file.path, {
        folder: `eventy/persons/users/${user_id}`,
        resource_type: "image",
      });

    fs.unlinkSync(file.path);

    const image = await Image.create({
      public_id,
      url,
      secure_url,
      size: file.size,
      format,
    });

    await UserImage.update(
      { is_profile: false },
      { where: { user_id, is_profile: true } },
    );

    await UserImage.create({
      public_id,
      user_id,
      is_profile: true,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      data: { public_id: image.public_id, url: image.url },
    });
  },
);

export const get = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user?.id;
    const { username } = req.params;

    const user = await Person.findOne({
      where: { username },
      attributes: [
        "id",
        "first_name",
        "last_name",
        "username",
        "email",
        "phone_number",
        [sequelize.col("User.followers_count"), "followers_count"],
        [sequelize.col("User.following_count"), "following_count"],
        [sequelize.col("User.friends_count"), "friends_count"],
        [
          sequelize.literal(
            "CASE WHEN \"Person\".id IN (SELECT id FROM organizer) THEN 'organizer' ELSE 'user' END",
          ),
          "type",
        ],
        [sequelize.col("User.Organizer.rate"), "rate"],
        [sequelize.col("User.Organizer.events_count"), "events_count"],
        [sequelize.col("User.Organizer.bio"), "bio"],
        [sequelize.col("User.UserImages.Image.secure_url"), "image_url"],
      ],
      include: [
        {
          model: User,
          required: true,
          attributes: [],
          include: [
            {
              model: Organizer,
              required: false,
              attributes: [],
            },
            {
              model: UserImage,
              attributes: [],
              include: [
                {
                  model: Image,
                  attributes: [],
                },
              ],
              where: { is_profile: true },
            },
          ],
        },
      ],
      subQuery: false,
      raw: true,
    });

    if (!user) throw new APIError("User not found", StatusCodes.NOT_FOUND);

    const data = Object.fromEntries(
      Object.entries(user).map(([key, value]) => {
        if (value === null) return [key, null];
        if (value === "null") return [key, null];
        if (value === "organizer") return [key, "organizer"];
        if (value === "user") return [key, "user"];
        return [key, value];
      }),
    );

    if (user_id == user?.id || !user_id) {
      data.is_following = null;
      data.is_friend = null;
    } else {
      const is_following = await Follow.findOne({
        where: { follower_id: user_id, followed_id: user.id },
      });
      const is_friend = await Friendship.findOne({
        where: {
          [Op.or]: [
            { sender_id: user_id, receiver_id: user.id },
            { sender_id: user.id, receiver_id: user_id },
          ],
        },
      });
      data.is_following = !!is_following;
      data.is_friend = !!is_friend;
    }
    return res.status(StatusCodes.OK).json({
      success: true,
      data,
    });
  },
);

export const likes = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const apifeatures = new APIFeatures(req.query).paginate();
    let literal!: [[Literal, string]];
    if (req.user) {
      if (req.user.id == +id) {
        literal = [[sequelize.literal(`true`), "is_liked"]];
      } else {
        literal = [
          [
            sequelize.literal(
              `CASE WHEN EXISTS (SELECT 1 FROM likes WHERE user_id = ${req.user.id} AND event_id = "Event"."id") THEN true ELSE false END`,
            ),
            "is_liked",
          ],
        ];
      }
    }

    const likes = await Like.findAll({
      where: { user_id: id },
      include: [
        {
          model: Event,
          required: true,
          attributes: [],
          include: [
            {
              model: Post,
              required: true,
              attributes: [],
            },
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
        "user_id",
        [sequelize.col("Event.id"), "event_id"],
        [sequelize.col("Event.Post.content"), "content"],
        [
          sequelize.literal(
            `CASE WHEN "Event"."date" > now() THEN true ELSE false END`,
          ),
          "is_upcoming",
        ],
        ...(literal?.length ? literal : []),
        [sequelize.col("Event.EventImages.Image.secure_url"), "image_url"],
      ],
      ...apifeatures.query,
      subQuery: false,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      data: likes,
    });
  },
);
export const interest = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const apifeatures = new APIFeatures(req.query).paginate();
    let literal!: [[Literal, string]];
    if (req.user) {
      if (req.user.id == +id) {
        literal = [[sequelize.literal(`true`), "is_liked"]];
      } else {
        literal = [
          [
            sequelize.literal(
              `CASE WHEN EXISTS (SELECT 1 FROM likes WHERE user_id = ${req.user.id} AND event_id = "Event"."id") THEN true ELSE false END`,
            ),
            "is_liked",
          ],
        ];
      }
    }

    const interests = await Event_Interest.findAll({
      where: { user_id: id },
      include: [
        {
          model: Event,
          required: true,
          attributes: [],
          include: [
            {
              model: Post,
              required: true,
              attributes: [],
            },
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
        "user_id",
        [sequelize.col("Event.id"), "event_id"],
        [sequelize.col("Event.Post.content"), "content"],
        [
          sequelize.literal(
            `CASE WHEN "Event"."date" > now() THEN true ELSE false END`,
          ),
          "is_upcoming",
        ],
        ...(literal?.length ? literal : []),
        [sequelize.col("Event.EventImages.Image.secure_url"), "image_url"],
      ],
      ...apifeatures.query,
      subQuery: false,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      data: interests,
    });
  },
);
