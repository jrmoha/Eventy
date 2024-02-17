import { NextFunction, Request, Response } from "express";
import { UnfriendInput } from "./friendship.validator";
import { async_ } from "../../interfaces/middleware/async.middleware";
import Friendship from "./friendship.model";
import { Op } from "sequelize";
import { APIError } from "../../types/APIError.error";
import StatusCodes from "http-status-codes";
import User from "../user/user.model";

export const unfriend = async_(
  async (
    req: Request<UnfriendInput, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const other_id = +req.params.id;

    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { sender_id: user_id, receiver_id: other_id },
          { sender_id: other_id, receiver_id: user_id },
        ],
      },
    });
    if (!friendship)
      throw new APIError(
        "You must be friend with this user to unfriend",
        StatusCodes.BAD_REQUEST,
      );

    await friendship.destroy();

    await User.decrement("friends_count", {
      by: 1,
      where: {
        [Op.or]: [{ id: user_id }, { id: other_id }],
      },
    });
    
    return res.status(StatusCodes.OK).json({ success: true });
  },
);
