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
        // eslint-disable-next-line quotes
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
