import { APIFeatures } from "../../lib/api.features";
import { FindAttributeOptions } from "sequelize";
import { sequelize } from "../../database";
import { Literal } from "sequelize/types/utils";
import UserImage from "../user/image/user.image.model";
import Person from "../person/person.model";
import User from "../user/user.model";
import Follow from "./follow.model";
import Image from "../image/image.model";

export class FollowService {
  private readonly followerAttributes: FindAttributeOptions;
  private readonly followingsAttributes: FindAttributeOptions;
  constructor() {
    this.followerAttributes = [
      [sequelize.col("follower.id"), "id"],
      [sequelize.col("follower.followers_count"), "followers_count"],
      [
        sequelize.fn(
          "concat",
          sequelize.col("follower.Person.first_name"),
          " ",
          sequelize.col("follower.Person.last_name"),
        ),
        "full_name",
      ],
      [sequelize.col("follower.Person.username"), "username"],
      [sequelize.col("follower.UserImages.Image.url"), "image_url"],
      [
        sequelize.literal(
          "CASE WHEN follower.id IN (SELECT id FROM organizer WHERE id = follower.id) THEN 'o' ELSE 'u' END",
        ),
        "role",
      ],
    ];
    this.followingsAttributes = [
      [sequelize.col("following.id"), "id"],
      [sequelize.col("following.followers_count"), "followers_count"],
      [
        sequelize.fn(
          "concat",
          sequelize.col("following.Person.first_name"),
          " ",
          sequelize.col("following.Person.last_name"),
        ),
        "full_name",
      ],
      [sequelize.col("following.Person.username"), "username"],
      [sequelize.col("following.UserImages.Image.url"), "image_url"],
      [
        sequelize.literal(
          "CASE WHEN following.id IN (SELECT id FROM organizer WHERE id = following.id) THEN 'o' ELSE 'u' END",
        ),
        "role",
      ],
    ];
  }
  public async followers(
    id: number,
    current_id: number | undefined,
    apifeatures: APIFeatures,
  ) {
    let literal!: [Literal, string];
    if (current_id) {
      literal = [
        sequelize.literal(
          `CASE WHEN "follower"."id" IN (SELECT "followed_id" FROM "follow" WHERE "follower_id" = ${current_id}) THEN true ELSE false END`,
        ),
        "followed",
      ];
    }

    return Follow.findAll({
      where: { followed_id: id },
      include: [
        {
          model: User,
          attributes: [],
          as: "follower",
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
      ],
      attributes: [
        ...(this.followerAttributes as []),
        ...(literal?.length ? [literal] : []),
      ],
      order: [["createdAt", "DESC"]],
      ...apifeatures.query,
      raw: true,
      subQuery: false,
    });
  }
  public async followings(
    id: number,
    current_id: number | undefined,
    apifeatures: APIFeatures,
  ): Promise<Follow[]> {
    let literal!: [Literal, string];
    if (id == current_id) {
      literal = [sequelize.literal("true"), "followed"];
    } else if (current_id) {
      literal = [
        sequelize.literal(
          `CASE WHEN "following"."id" IN (SELECT "followed_id" FROM "follow" WHERE "follower_id" = ${current_id}) THEN true ELSE false END`,
        ),
        "followed",
      ];
    }
    return Follow.findAll({
      where: { follower_id: id },
      include: [
        {
          model: User,
          attributes: [],
          required: true,
          as: "following",
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
      ],
      attributes: [
        ...(this.followingsAttributes as []),
        ...(literal?.length ? [literal] : []),
      ],
      order: [["createdAt", "DESC"]],
      ...apifeatures.query,
      raw: true,
      subQuery: false,
    });
  }
}
