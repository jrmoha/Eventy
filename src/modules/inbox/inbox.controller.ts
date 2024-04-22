import { InboxSerivce } from "./inbox.service";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { APIFeatures } from "../../utils/api.features";

export const get_inboxes = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user?.id;
    if (!user_id) return;

    const apifeatures = new APIFeatures(req.query).paginate();
    const InboxSerivceInstance = new InboxSerivce();
    const inboxes = await InboxSerivceInstance.getAllInboxes(
      user_id,
      apifeatures,
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      data: inboxes,
    });
  },
);
