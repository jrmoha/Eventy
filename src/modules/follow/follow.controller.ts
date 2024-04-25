import { FollowService } from "./follow.service";
import { NextFunction, Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import StatusCodes from "http-status-codes";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { APIError } from "../../error/api-error";
import Follow from "./follow.model";
import User from "../user/user.model";
import Person from "../person/person.model";
import { FollowInput } from "./follow.validator";
import Settings from "../user/settings/settings.model";
import Friendship from "../friendship/friendship.model";
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
    const FollowServiceInstance = new FollowService();
    const followers = await FollowServiceInstance.followers(
      +id,
      req.user?.id,
      apifeatures,
    );

    if (+id == req.user?.id)
      return res
        .status(StatusCodes.OK)
        .json({ success: true, data: followers });

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

    return res.status(StatusCodes.OK).json({ success: true, data: followers });
  },
);

export const followings = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const apifeatures = new APIFeatures(req.query).paginate();

    const FollowServiceInstance = new FollowService();
    const followingsData = await FollowServiceInstance.followings(
      +id,
      req.user?.id,
      apifeatures,
    );

    //if current user return without coniditions
    if (+id == req.user?.id)
      return res
        .status(StatusCodes.OK)
        .json({ success: true, data: followingsData });

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

    return res
      .status(StatusCodes.OK)
      .json({ success: true, data: followingsData });
  },
);
