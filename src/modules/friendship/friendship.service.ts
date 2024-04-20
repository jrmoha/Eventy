import { FindAttributeOptions, Op } from "sequelize";
import { APIFeatures } from "../../utils/api.features";
import Friendship from "./friendship.model";
import { sequelize } from "../../database";
import User from "../user/user.model";
import Person from "../person/person.model";
import UserImage from "../image/user.image.model";
import Image from "../image/image.model";
import { Literal } from "sequelize/types/utils";

export class FriendshipService {
  constructor() {}
  private friendsAttributes(id: number): FindAttributeOptions {
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
  }
  private friendsIncludes() {
    return {
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
  }
  public async friends(
    user_id: number,
    current_id: number | undefined,
    apifeatures: APIFeatures,
  ): Promise<Friendship[] | null> {
    if (user_id == current_id) {
      return Friendship.findAll({
        where: {
          [Op.or]: [{ sender_id: user_id }, { receiver_id: user_id }],
        },
        include: [
          this.friendsIncludes().sender,
          this.friendsIncludes().receiver,
        ],
        attributes: this.friendsAttributes(user_id),
        order: [["createdAt", "DESC"]],
        ...apifeatures.query,
        raw: true,
        subQuery: false,
      });
    }
    let literal!: [Literal, string];
    if (current_id) {
      literal = [
        sequelize.literal(
          `CASE WHEN "sender"."id" = ${current_id} OR "receiver"."id" = ${current_id} THEN true ELSE false END`,
        ),
        "is_friends",
      ];
    }
    return Friendship.findAll({
      where: {
        [Op.or]: [{ sender_id: user_id }, { receiver_id: user_id }],
      },
      include: [this.friendsIncludes().sender, this.friendsIncludes().receiver],
      attributes: [
        ...(this.friendsAttributes(user_id) as unknown as []),
        ...(literal.length ? [literal] : []),
      ],
      raw: true,
      subQuery: false,
    });
  }
}
