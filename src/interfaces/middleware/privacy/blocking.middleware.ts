import { NextFunction, Request, Response } from "express";
import { async_ } from "../async.middleware";
import { APIError } from "../../../error/api-error";
import { StatusCodes } from "http-status-codes";
import Block from "../../../modules/block/block.model";
import { Op } from "sequelize";
import Person from "../../../modules/person/person.model";

export const blocking = (target: string) => {
  return async_(async (req: Request, res: Response, next: NextFunction) => {
    const current_user_id = req.user?.id;
    let target_id;

    if (target == ":id") target_id = req.params.id;
    else if (target == ":username") {
      const person = await Person.findOne({
        where: { username: req.params.username },
      });
      if (!person) throw new APIError("User not found", StatusCodes.NOT_FOUND);
      req.params.id = `${person.id}`;
      target_id = person.id;
    }

    if (!current_user_id || current_user_id?.toString() == target.toString())
      return next();

    const block = await Block.findOne({
      where: {
        [Op.or]: [
          { blocked_id: current_user_id, blocker_id: target_id },
          { blocked_id: target_id, blocker_id: current_user_id },
        ],
      },
    });

    if (block) throw new APIError("Access denied", StatusCodes.FORBIDDEN);

    return next();
  });
};
