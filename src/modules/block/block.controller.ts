import { BlockService } from "./block.service";
import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { APIError } from "../../error/api-error";
import { StatusCodes } from "http-status-codes";
import User from "../user/user.model";

export const block = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user?.id;
    const blocked_user_id = req.params.id;

    const blocked_user = await User.findByPk(blocked_user_id);
    if (!blocked_user)
      throw new APIError("User not found", StatusCodes.NOT_FOUND);

    const BlockServiceInstance = new BlockService();
    const block_exists = await BlockServiceInstance.any_block_exists(
      user_id,
      +blocked_user_id,
    );

    if (block_exists)
      throw new APIError("Block already exists", StatusCodes.BAD_REQUEST);

    await BlockServiceInstance.block(user_id, +blocked_user_id);

    return res.status(StatusCodes.OK).json({ success: true });
  },
);

export const unblock = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user?.id;
    const blocked_user_id = req.params.id;

    const BlockServiceInstance = new BlockService();
    const block = await BlockServiceInstance.block_exists(
      user_id,
      +blocked_user_id,
    );

    if (!block) throw new APIError("Block not found", StatusCodes.NOT_FOUND);

    await BlockServiceInstance.unblock(block);

    return res.status(StatusCodes.OK).json({ success: true });
  },
);
