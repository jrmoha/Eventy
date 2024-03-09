import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { sequelize } from "../../database";
import { async_ } from "../../interfaces/middleware/async.middleware";
import UserImage from "../image/user.image.model";
import Person from "../person/person.model";
import User from "../user/user.model";
import Inbox from "./inbox.model";
import Image from "../image/image.model";
import { APIFeatures } from "../../utils/api.features";
const includes = {
  sender: {
    model: User,
    as: "sender",
    attributes: [],
    required: true,
    include: [
      {
        model: Person,
        attributes: [],
        required: true,
      },
      {
        model: UserImage,
        attributes: [],
        required: true,
        where: { is_profile: true },
        include: [
          {
            model: Image,
            attributes: [],
            required: true,
          },
        ],
      },
    ],
  },
  receiver: {
    model: User,
    as: "receiver",
    attributes: [],
    required: true,
    include: [
      {
        model: Person,
        attributes: [],
        required: true,
      },
      {
        model: UserImage,
        attributes: [],
        required: true,
        where: { is_profile: true },
        include: [
          {
            model: Image,
            attributes: [],
            required: true,
          },
        ],
      },
    ],
  },
};
export const get_inboxes = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user?.id;
    const apifeatures = new APIFeatures(req.query).paginate();
    const inboxes = await Inbox.findAll({
      where: {
        [Op.or]: [{ sender_id: user_id }, { receiver_id: user_id }],
      },
      include: [includes.sender, includes.receiver],
      attributes: [
        "id",
        "last_message",
        "last_message_time",
        [
          sequelize.literal(
            `CASE WHEN "sender"."id" = ${user_id} THEN CONCAT("receiver->Person"."first_name", ' ', "receiver->Person"."last_name") ELSE CONCAT("sender->Person"."first_name", ' ', "sender->Person"."last_name") END`,
          ),
          "full_name",
        ],
        [
          sequelize.literal(
            `CASE WHEN "sender"."id" = ${user_id} THEN "receiver->UserImages->Image"."url" ELSE "sender->UserImages->Image"."url" END`,
          ),
          "profile_image",
        ],
      ],
      ...apifeatures.query,
      order: [["updatedAt", "DESC"]],
      raw: true,
      subQuery: false,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      data: inboxes,
    });
  },
);
