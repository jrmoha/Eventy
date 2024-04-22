import { FindAttributeOptions, Op } from "sequelize";
import Inbox from "./inbox.model";
import { sequelize } from "../../database";
import { APIFeatures } from "../../utils/api.features";
import User from "../user/user.model";
import Person from "../person/person.model";
import UserImage from "../image/user.image.model";
import Image from "../image/image.model";

export class InboxSerivce {
  constructor() {}
  private inboxesAttributes(user_id: number): FindAttributeOptions {
    return [
      "id",
      "last_message",
      [
        sequelize.literal(
          `to_char("last_message_time", 'YYYY-MM-DD HH24:MI:SS')`,
        ),
        "last_message_time",
      ],
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
    ];
  }
  private inboxesIncludes() {
    return {
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
  }
  public async getAllInboxes(
    user_id: number,
    apifeatures: APIFeatures,
  ): Promise<Inbox[]> {
    const includes = this.inboxesIncludes();
    const attributes = this.inboxesAttributes(user_id);

    return Inbox.findAll({
      where: {
        [Op.or]: [{ sender_id: user_id }, { receiver_id: user_id }],
      },
      include: [includes.sender, includes.receiver],
      attributes,
      ...apifeatures.query,
      order: [["last_message_time", "DESC"]],
      raw: true,
      subQuery: false,
    });
  }
}
