import { NextFunction, Request, Response } from "express";
import { UnfriendInput } from "./friendship.validator";
import { async_ } from "../../interfaces/middleware/async.middleware";
import Friendship from "./friendship.model";
import { FindAttributeOptions, Op } from "sequelize";
import { APIError } from "../../error/api-error";
import StatusCodes from "http-status-codes";
import User from "../user/user.model";
import { sequelize } from "../../database";
import Person from "../person/person.model";
import UserImage from "../image/user.image.model";
import Image from "../image/image.model";
import Settings from "../settings/settings.model";
import { APIFeatures } from "../../utils/api.features";

const includes = {
  sender: {
    model: User,
    as: "sender",
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
  receiver: {
    model: User,
    as: "receiver",
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
};
const attrs = (id: number): FindAttributeOptions => {
  return [
    [sequelize.literal("true"), "is_friends"],
    [
      sequelize.literal(
        `CASE WHEN "sender"."id" = ${id} THEN "receiver"."followers_count" ELSE "sender"."followers_count" END`,
      ),
      "followers_count",
    ],
    [
      sequelize.literal(
        `CASE WHEN "sender"."id" = ${id} THEN "receiver"."id" ELSE "sender"."id" END`,
      ),
      "id",
    ],
    [
      sequelize.literal(
        `CASE WHEN "sender"."id" = ${id} THEN "receiver->Person"."username" ELSE "sender->Person"."username" END`,
      ),
      "username",
    ],
    [
      sequelize.literal(
        `CASE WHEN "sender"."id" = ${id} THEN CONCAT("receiver->Person"."first_name", ' ', "receiver->Person"."last_name") ELSE CONCAT("sender->Person"."first_name", ' ', "sender->Person"."last_name") END`,
      ),
      "full_name",
    ],
    [
      sequelize.literal(
        `CASE WHEN "sender"."id" = ${id} THEN "receiver->UserImages->Image"."url" ELSE "sender->UserImages->Image"."url" END`,
      ),
      "image_url",
    ],
    [
      sequelize.literal(
        `CASE WHEN EXISTS (SELECT 1 FROM organizer WHERE id = sender.id) THEN 'o' ELSE 'u' END`,
      ),
      "role",
    ],
  ];
};
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

export const get_friends = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const apifeatures = new APIFeatures(req.query).paginate();

    if (+id == req.user?.id) {
      const friends = await Friendship.findAll({
        where: {
          [Op.or]: [{ sender_id: id }, { receiver_id: id }],
        },
        include: [includes.sender, includes.receiver],
        attributes: attrs(+id),
        order: [["createdAt", "DESC"]],
        ...apifeatures.query,
        raw: true,
        subQuery: false,
      });

      return res.status(StatusCodes.OK).json({ success: true, data: friends });
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
    if (settings?.friends_visibility == "none")
      throw new APIError("Access denied", StatusCodes.NOT_FOUND);

    if (settings?.friends_visibility == "friends") {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let literal: any = [];
    if (req.user?.id) {
      literal = [
        sequelize.literal(
          `CASE WHEN "sender"."id" = ${req.user?.id} OR "receiver"."id" = ${req.user?.id} THEN true ELSE false END`,
        ),
        "is_friends",
      ];
    }
    const friends = await Friendship.findAll({
      where: {
        [Op.or]: [{ sender_id: id }, { receiver_id: id }],
      },
      include: [includes.sender, includes.receiver],
      attributes: [
        ...(attrs(+id) as unknown as [FindAttributeOptions]),
        ...(literal.length ? [literal] : []),
      ],
      raw: true,
      subQuery: false,
    });

    return res.status(StatusCodes.OK).json({ success: true, data: friends });
  },
);
