import { NextFunction, Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import StatusCodes from "http-status-codes";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { APIError } from "../../types/APIError.error";
import Follow from "./follow.model";
import User from "../user/user.model";
import Person from "../person/person.model";
import { FollowInput } from "./follow.validator";
import Settings from "../user/user.settings.model";
import Friendship from "../friendship/friendship.model";
import UserImage from "../image/user.image.model";
import Image from "../image/image.model";
import { sequelize } from "../../database";
import { Literal } from "sequelize/types/utils";
import { APIFeatures } from "../../utils/api.features";

export const follow = async_(
  async (
    req: Request<FollowInput, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    const follower_id = req.user?.id;
    const followed_id = +req.params.id; //convert string parameter into number

    if (follower_id == followed_id)
      throw new APIError("You can't follow yourself", StatusCodes.BAD_REQUEST);

    const followed = await User.findOne({
      where: { id: followed_id },
      include: [
        {
          model: Person,
          attributes: ["confirmed"],
        },
      ],
      attributes: [
        "id",
        "followers_count",
        [Sequelize.literal('"Person"."confirmed"'), "confirmed"],
      ],
    });

    if (!followed) throw new APIError("User not found", StatusCodes.NOT_FOUND);
    if (!followed.confirmed)
      throw new APIError("User not confirmed", StatusCodes.BAD_REQUEST);

    const follow = await Follow.findOne({
      where: { follower_id, followed_id },
    });
    if (follow)
      throw new APIError("Already following", StatusCodes.BAD_REQUEST);

    await Follow.create({ follower_id, followed_id });
    await User.increment("following_count", {
      by: 1,
      where: { id: follower_id },
    });

    followed.increment("followers_count", {
      by: 1,
    });
    await followed.save();
    return res.status(StatusCodes.OK).json({ success: true });
  },
);
export const unfollow = async_(
  async (
    req: Request<FollowInput, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    const follower_id = req.user?.id;
    const followed_id = +req.params.id; //convert string parameter into number

    if (follower_id == followed_id)
      throw new APIError(
        "You can't unfollow yourself",
        StatusCodes.BAD_REQUEST,
      );

    const follow = await Follow.findOne({
      where: [
        {
          follower_id,
          followed_id,
        },
      ],
    });
    if (!follow)
      throw new APIError(
        "you're already not following this user",
        StatusCodes.BAD_REQUEST,
      );
    await follow.destroy();
    await User.decrement("following_count", {
      by: 1,
      where: { id: follower_id },
    });
    await User.decrement("followers_count", {
      by: 1,
      where: { id: followed_id },
    });
    return res.status(StatusCodes.OK).json({ success: true });
  },
);

export const followers = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const apifeatures = new APIFeatures(req.query).paginate();

    let literal!: [Literal, string];
    if (req.user?.id) {
      literal = [
        sequelize.literal(
          `CASE WHEN "follower"."id" IN (SELECT "followed_id" FROM "follow" WHERE "follower_id" = ${req.user?.id}) THEN true ELSE false END`,
        ),
        "followed",
      ];
    }

    if (+id == req.user?.id) {
      const followers = await Follow.findAll({
        where: { followed_id: +id },
        include: [
          {
            model: User,
            attributes: [],
            as: "follower",
            include: [
              {
                model: Person,
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
          },
        ],
        attributes: [
          [sequelize.col("follower.id"), "id"],
          [sequelize.col("follower.followers_count"), "followers_count"],
          [
            sequelize.fn(
              "concat",
              sequelize.col("follower.Person.first_name"),
              " ",
              sequelize.col("follower.Person.last_name"),
            ),
            "full_name",
          ],
          [sequelize.col("follower.UserImages.Image.url"), "image_url"],
          ...(literal.length ? [literal] : []),
        ],
        order: [["createdAt", "DESC"]],
        ...apifeatures.query,
        raw: true,
        subQuery: false,
      });
      return res
        .status(StatusCodes.OK)
        .json({ success: true, data: followers });
    }

    const user = await Person.findByPk(+id, {
      include: [
        {
          model: User,
          required: true,
          attributes: [],
        },
      ],
    });

    if (!user) throw new APIError("User not found", StatusCodes.NOT_FOUND);
    if (!user.confirmed)
      throw new APIError("Error occurred", StatusCodes.BAD_REQUEST);

    const settings = await Settings.findOne({
      where: { user_id: user.id },
    });
    if (settings?.followers_visibility == "none")
      throw new APIError("Access denied", StatusCodes.NOT_FOUND);

    if (settings?.followers_visibility == "friends") {
      const isFriends = req.user?.id
        ? await Friendship.findOne({
            where: {
              [Op.or]: [
                { sender_id: user.id, receiver_id: req.user?.id },
                { receiver_id: req.user?.id, sender_id: user.id },
              ],
            },
          })
        : null;
      if (!isFriends)
        throw new APIError("Access denied", StatusCodes.NOT_FOUND);
    }

    const followers = await Follow.findAll({
      where: { followed_id: id },
      include: [
        {
          model: User,
          attributes: [],
          required: true,
          as: "follower",
          include: [
            {
              model: Person,
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
        [sequelize.col("follower.id"), "id"],
        [
          sequelize.fn(
            "concat",
            sequelize.col("follower.Person.first_name"),
            " ",
            sequelize.col("follower.Person.last_name"),
          ),
          "full_name",
        ],
        [sequelize.col("follower.UserImages.Image.url"), "image_url"],
        [sequelize.col("follower.followers_count"), "followers_count"],
        ...(literal?.length ? [literal] : []),
      ],
      order: [["createdAt", "DESC"]],
      ...apifeatures.query,
      raw: true,
      subQuery: false,
    });
    return res.status(StatusCodes.OK).json({ success: true, data: followers });
  },
);

export const followings = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const apifeatures = new APIFeatures(req.query).paginate();

    if (+id == req.user?.id) {
      const followings = await Follow.findAll({
        where: { follower_id: +id },
        include: [
          {
            model: User,
            attributes: [],
            as: "following",
            include: [
              {
                model: Person,
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
          },
        ],
        attributes: [
          [sequelize.col("following.id"), "id"],
          [sequelize.col("following.followers_count"), "followers_count"],
          [
            sequelize.fn(
              "concat",
              sequelize.col("following.Person.first_name"),
              " ",
              sequelize.col("following.Person.last_name"),
            ),
            "full_name",
          ],
          [sequelize.col("following.UserImages.Image.url"), "image_url"],
          [sequelize.literal("true"), "followed"],
        ],
        order: [["createdAt", "DESC"]],
        ...apifeatures.query,
        raw: true,
        subQuery: false,
      });
      return res
        .status(StatusCodes.OK)
        .json({ success: true, data: followings });
    }

    const user = await Person.findByPk(+id, {
      include: [
        {
          model: User,
          required: true,
          attributes: [],
        },
      ],
    });

    if (!user) throw new APIError("User not found", StatusCodes.NOT_FOUND);
    if (!user.confirmed)
      throw new APIError("Error occurred", StatusCodes.BAD_REQUEST);

    const settings = await Settings.findOne({
      where: { user_id: user.id },
    });
    if (settings?.following_visibility == "none")
      throw new APIError("Access denied", StatusCodes.NOT_FOUND);

    if (settings?.following_visibility == "friends") {
      const isFriends = req.user?.id
        ? await Friendship.findOne({
            where: {
              [Op.or]: [
                { sender_id: user.id, receiver_id: req.user?.id },
                { receiver_id: req.user?.id, sender_id: user.id },
              ],
            },
          })
        : null;
      if (!isFriends)
        throw new APIError("Access denied", StatusCodes.NOT_FOUND);
    }

    let literal!: [Literal, string];
    if (req.user?.id) {
      literal = [
        sequelize.literal(
          `CASE WHEN "following"."id" IN (SELECT "followed_id" FROM "follow" WHERE "follower_id" = ${req.user?.id}) THEN true ELSE false END`,
        ),
        "followed",
      ];
    }

    const followings = await Follow.findAll({
      where: { follower_id: id },
      include: [
        {
          model: User,
          attributes: [],
          required: true,
          as: "following",
          include: [
            {
              model: Person,
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
        [sequelize.col("following.id"), "id"],
        [sequelize.col("following.followers_count"), "followers_count"],
        [
          sequelize.fn(
            "concat",
            sequelize.col("following.Person.first_name"),
            " ",
            sequelize.col("following.Person.last_name"),
          ),
          "full_name",
        ],
        [sequelize.col("following.UserImages.Image.url"), "image_url"],
        ...(literal?.length ? [literal] : []),
      ],
      order: [["createdAt", "DESC"]],
      ...apifeatures.query,
      raw: true,
      subQuery: false,
    });
    return res.status(StatusCodes.OK).json({ success: true, data: followings });
  },
);
