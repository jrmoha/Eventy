import { FriendRequestService } from "./friendrequest.service";
import { NextFunction, Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import StatusCodes from "http-status-codes";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { APIError } from "../../error/api-error";
import FriendRequest from "./friendrequest.model";
import User from "../user/user.model";
import Block from "../block/block.model";
import Person from "../person/person.model";
import { FriendRequestInput } from "./friendrequest.validator";
import Friendship from "../friendship/friendship.model";
import { APIFeatures } from "../../lib/api.features";

export const get_all = async_(
  async (req: Request<{}, {}, {}>, res: Response, next: NextFunction) => {
    const user_id = req.user?.id;
    if (!user_id) return;

    const apifeatures = new APIFeatures(req.query).paginate();
    const FriendRequestServiceInstance = new FriendRequestService();
    const friend_requests =
      await FriendRequestServiceInstance.getAllFriendRequests(
        user_id,
        apifeatures,
      );

    return res
      .status(StatusCodes.OK)
      .json({ success: true, data: friend_requests });
  },
);

export const send = async_(
  async (
    req: Request<FriendRequestInput, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    const sender_id = req.user?.id;
    const receiver_id = +req.params.id;

    if (sender_id == receiver_id)
      throw new APIError(
        "You cannot send a friend request to yourself",
        StatusCodes.BAD_REQUEST,
      );

    const receiver = await User.findByPk(receiver_id, {
      include: [
        {
          model: Person,
          attributes: ["confirmed"],
        },
      ],
      attributes: [
        "id",
        [Sequelize.literal('"Person"."confirmed"'), "confirmed"],
      ],
    });
    if (!receiver) throw new APIError("User not found", StatusCodes.NOT_FOUND);
    if (!receiver.confirmed)
      throw new APIError("User not confirmed", StatusCodes.BAD_REQUEST);

    const isBlocked = await Block.findOne({
      where: {
        [Op.or]: [
          { blocked_id: sender_id, blocker_id: receiver_id },
          { blocked_id: receiver_id, blocker_id: sender_id },
        ],
      },
    });
    if (isBlocked)
      throw new APIError("You are blocked by this user", StatusCodes.FORBIDDEN);

    const already_sent = await FriendRequest.findOne({
      where: {
        [Op.or]: [
          { sender_id, receiver_id },
          { sender_id: receiver_id, receiver_id: sender_id },
        ],
      },
    });

    if (already_sent)
      throw new APIError(
        "Already there's a friend request",
        StatusCodes.CONFLICT,
      );
    const is_friends = await Friendship.findOne({
      where: {
        [Op.or]: [
          { sender_id, receiver_id },
          { sender_id: receiver_id, receiver_id: sender_id },
        ],
      },
    });

    if (is_friends)
      throw new APIError(
        "Cannot send friend request to a friend",
        StatusCodes.BAD_REQUEST,
      );

    const friend_request = await FriendRequest.create({
      sender_id,
      receiver_id,
    });

    return friend_request
      ? res.status(StatusCodes.OK).json({ success: true })
      : next(new APIError("Error Occurred", StatusCodes.INTERNAL_SERVER_ERROR));
  },
);

export const accept = async_(
  async (
    req: Request<FriendRequestInput, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    const receiver_id = req.user?.id;
    const sender_id = +req.params.id;

    if (sender_id == receiver_id)
      throw new APIError(
        "You send a friend request to yourself",
        StatusCodes.BAD_REQUEST,
      );

    const friend_request = await FriendRequest.findOne({
      where: {
        sender_id,
        receiver_id,
      },
    });

    if (!friend_request)
      throw new APIError(
        "No Friend Request to accept",
        StatusCodes.BAD_REQUEST,
      );

    const friendship = await Friendship.create({
      sender_id,
      receiver_id,
    });
    if (!friendship)
      throw new APIError("Error Occurred", StatusCodes.INTERNAL_SERVER_ERROR);

    await User.increment("friends_count", {
      where: { [Op.or]: [{ id: sender_id }, { id: receiver_id }] },
      by: 1,
    });

    await friend_request.destroy();

    return res.status(StatusCodes.CREATED).json({ success: true });
  },
);

export const cancel = async_(
  async (
    req: Request<FriendRequestInput, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const other_id = +req.params.id;

    const friend_request = await FriendRequest.findOne({
      where: {
        [Op.or]: [
          { sender_id: user_id, receiver_id: other_id },
          { sender_id: other_id, receiver_id: user_id },
        ],
      },
    });

    if (!friend_request)
      throw new APIError(
        "No Friend Request to cancel",
        StatusCodes.BAD_REQUEST,
      );

    await friend_request.destroy();

    return res.status(StatusCodes.OK).json({ success: true });
  },
);
