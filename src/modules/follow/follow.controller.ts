import { NextFunction, Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import StatusCodes from "http-status-codes";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { APIError } from "../../types/APIError.error";
import Follow from "./follow.model";
import User from "../user/user.model";
import Block from "../block/block.model";
import Person from "../person/person.model";
import { FollowInput } from "./follow.validator";
import Settings from "../user/user.settings.model";
import Friendship from "../friendship/friendship.model";
import UserImage from "../image/user.image.model";
import Image from "../image/image.model";
import { sequelize } from "../../database";

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

    const isBlocked = await Block.findOne({
      where: {
        [Op.or]: [
          { blocked_id: followed_id, blocker_id: follower_id },
          { blocked_id: follower_id, blocker_id: followed_id },
        ],
      },
    });
    if (isBlocked)
      throw new APIError("You are blocked by this user", StatusCodes.FORBIDDEN);

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
    const { username } = req.params;
    const user = await Person.findOne({ where: { username } });

    if (user?.id == req.user?.id) {
      const followers = await Follow.findAll({
        where: { followed_id: user?.id },
        include: [
          {
            model: User,
            attributes: [],
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
              },
            ],
          },
        ],
        attributes: [
          [sequelize.col("User.id"), "id"],
          [
            sequelize.fn(
              "concat",
              sequelize.col("User.Person.first_name"),
              " ",
              sequelize.col("User.Person.last_name"),
            ),
            "full_name",
          ],
          [sequelize.col("User.UserImages.Image.url"), "image_url"],
        ],
      });
      return res
        .status(StatusCodes.OK)
        .json({ success: true, data: followers });
    }

    if (!user) throw new APIError("User not found", StatusCodes.NOT_FOUND);
    if (!user.confirmed)
      throw new APIError("User not confirmed", StatusCodes.BAD_REQUEST);

    const isBlocked = req.user?.id
      ? await Block.findOne({
          where: {
            [Op.or]: [
              { blocked_id: user.id, blocker_id: req.user?.id },
              { blocked_id: req.user?.id, blocker_id: user.id },
            ],
          },
        })
      : null;
    if (isBlocked) throw new APIError("Access denied", StatusCodes.FORBIDDEN);

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
      where: { followed_id: user.id },
      include: [
        {
          model: User,
          attributes: [],
          required: true,
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
            },
          ],
        },
      ],
      attributes: [
        [sequelize.col("User.id"), "id"],
        [
          sequelize.fn(
            "concat",
            sequelize.col("User.Person.first_name"),
            " ",
            sequelize.col("User.Person.last_name"),
          ),
          "full_name",
        ],
        [sequelize.col("User.UserImages.Image.url"), "image_url"],
        [
          sequelize.literal(
            `CASE WHEN "User"."id" IN (SELECT 1 FROM "follow" WHERE "follow"."follower_id" = ${req.user?.id} AND "follow"."followed_id" = "User"."id" LIMIT 1) THEN true ELSE false END`,
          ),
          "followed",
        ],
      ],
    });
    return res.status(StatusCodes.OK).json({ success: true, data: followers });
  },
);
export const followings = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.params;

    const user = await Person.findOne({ where: { username } });

    if (user?.id == req.user?.id) {
      const followings = await Follow.findAll({
        where: { follower_id: user?.id },
        include: [
          {
            model: User,
          },
        ],
      });
      return res
        .status(StatusCodes.OK)
        .json({ success: true, data: followings });
    }

    if (!user) throw new APIError("User not found", StatusCodes.NOT_FOUND);
    if (!user.confirmed)
      throw new APIError("User not confirmed", StatusCodes.BAD_REQUEST);

    const isBlocked = await Block.findOne({
      where: {
        [Op.or]: [
          { blocked_id: user.id, blocker_id: req.user?.id },
          { blocked_id: req.user?.id, blocker_id: user.id },
        ],
      },
    });
    if (isBlocked) throw new APIError("Access denied", StatusCodes.FORBIDDEN);

    const settings = await Settings.findOne({
      where: { user_id: user.id },
    });
    if (settings?.following_visibility == "none")
      throw new APIError("Access denied", StatusCodes.NOT_FOUND);

    if (settings?.following_visibility == "friends") {
      const isFriends = await Friendship.findOne({
        where: {
          [Op.or]: [
            { sender_id: user.id, receiver_id: req.user?.id },
            { receiver_id: req.user?.id, sender_id: user.id },
          ],
        },
      });
      if (!isFriends)
        throw new APIError("Access denied", StatusCodes.NOT_FOUND);
    }
    const followings = await Follow.findAll({
      where: { follower_id: user.id },
      include: [
        {
          model: User,
        },
      ],
    });
    return res.status(StatusCodes.OK).json({ success: true, data: followings });
  },
);
