import { FindAttributeOptions, Op } from "sequelize";
import { sequelize } from "../../database";
import Image from "../image/image.model";
import UserImage from "./image/user.image.model";
import User from "./user.model";
import Person from "../person/person.model";
import { Literal } from "sequelize/types/utils";
import Like from "../like/like.model";
import Post from "../post/post.model";
import Event from "../event/event.model";
import EventImage from "../event/image/event.image.model";
import { APIFeatures } from "../../lib/api.features";
import Event_Interest from "../event/interest/event.interest.model";

export class UserService {
  constructor() {}
  public async deleteUser(id: number): Promise<number> {
    return User.destroy({ where: { id } });
  }
  private likes_interests_attrs(
    literal?: [[Literal, string]],
  ): FindAttributeOptions {
    return [
      "user_id",
      [sequelize.col("Event.id"), "event_id"],
      [
        sequelize.fn(
          "to_char",
          sequelize.col("Event.date"),
          "YYYY-MM-DD HH24:MI:SS",
        ),
        "date",
      ],
      [sequelize.col("Event.time"), "time"],
      [sequelize.col("Event.Post.content"), "content"],
      [
        sequelize.literal(
          `CASE WHEN "Event"."date" > now() THEN true ELSE false END`,
        ),
        "is_upcoming",
      ],
      ...(literal?.length ? literal : []),
      [sequelize.col("Event.EventImages.Image.secure_url"), "image_url"],
    ];
  }
  public async profile(
    id: number,
    current_id: number | undefined,
  ): Promise<Person | null> {
    let literal!: [[Literal, string]];

    if (current_id && current_id !== +id) {
      literal = [
        [
          sequelize.literal(
            `CASE WHEN EXISTS (SELECT 1 FROM follow WHERE follower_id = ${current_id} AND followed_id = ${id}) THEN true ELSE false END`,
          ),
          "is_following",
        ],
      ];
      literal.push([
        sequelize.literal(
          `CASE WHEN EXISTS (SELECT 1 FROM friendship WHERE (sender_id = ${current_id} AND receiver_id = ${id}) OR (sender_id = ${id} AND receiver_id = ${current_id})) THEN true ELSE false END`,
        ),
        "is_friend",
      ]);
    }
    return Person.findOne({
      where: {
        id,
        [Op.and]: sequelize.literal(
          `NOT EXISTS (SELECT 1 FROM organizer WHERE id=:id)`,
        ),
      },
      include: [
        {
          model: User,
          required: true,
          attributes: [],
          include: [
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
        [
          sequelize.fn(
            "concat",
            sequelize.col("first_name"),
            " ",
            sequelize.col("last_name"),
          ),
          "full_name",
        ],
        "phone_number",
        "username",
        "id",
        "email",
        [sequelize.col("User.followers_count"), "followers_count"],
        [sequelize.col("User.following_count"), "following_count"],
        [sequelize.col("User.friends_count"), "friends_count"],
        [sequelize.col("User.UserImages.Image.url"), "profile_image"],
        ...(literal?.length ? literal : []),
      ],
      replacements: { id },
      benchmark: true,
    });
  }
  public async likes(
    id: number,
    current_id: number | undefined,
    apifeatures: APIFeatures,
  ): Promise<Like[] | null> {
    let literal!: [[Literal, string]];
    if (current_id) {
      if (current_id == id) {
        literal = [[sequelize.literal(`true`), "is_liked"]];
      } else {
        literal = [
          [
            sequelize.literal(
              `CASE WHEN EXISTS (SELECT 1 FROM likes WHERE user_id = ${current_id} AND event_id = "Event"."id") THEN true ELSE false END`,
            ),
            "is_liked",
          ],
        ];
      }
    }

    return Like.findAll({
      where: { user_id: id },
      include: [
        {
          model: Event,
          required: true,
          attributes: [],
          include: [
            {
              model: Post,
              required: true,
              attributes: [],
            },
            {
              model: EventImage,
              required: true,
              attributes: [],
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
      attributes: this.likes_interests_attrs(literal),
      ...apifeatures.query,
      subQuery: false,
    });
  }
  public async interests(
    id: number,
    current_id: number | undefined,
    apifeatures: APIFeatures,
  ): Promise<Event_Interest[] | null> {
    let literal!: [[Literal, string]];
    if (current_id) {
      if (current_id == id) {
        literal = [[sequelize.literal(`true`), "is_liked"]];
      } else {
        literal = [
          [
            sequelize.literal(
              `CASE WHEN EXISTS (SELECT 1 FROM likes WHERE user_id = ${current_id} AND event_id = "Event"."id") THEN true ELSE false END`,
            ),
            "is_liked",
          ],
        ];
      }
    }

    return Event_Interest.findAll({
      where: { user_id: id },
      include: [
        {
          model: Event,
          required: true,
          attributes: [],
          include: [
            {
              model: Post,
              required: true,
              attributes: [],
            },
            {
              model: EventImage,
              required: true,
              attributes: [],
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
      attributes: this.likes_interests_attrs(literal),
      ...apifeatures.query,
      subQuery: false,
    });
  }
}
