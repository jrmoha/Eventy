import { Literal } from "sequelize/types/utils";
import { sequelize } from "../../database";
import { APIFeatures } from "../../lib/api.features";
import Event from "../event/event.model";
import EventImage from "../event/image/event.image.model";
import Image from "../image/image.model";
import Post from "../post/post.model";
import Person from "../person/person.model";
import User from "../user/user.model";
import Organizer from "./organizer.model";
import UserImage from "../user/image/user.image.model";
import { Transaction } from "sequelize";

export class OrganizerService {
  constructor() {}
  public async insertIfNotExists(
    id: number,
    t?: Transaction,
  ): Promise<[Organizer, boolean]> {
    return Organizer.findOrCreate({
      where: { id },
      defaults: {
        id,
      },
      transaction: t,
    });
  }
  public async getOrganizerProfile(
    organizer_id: number,
    current_id: number | undefined,
  ) {
    let literal!: [[Literal, string]];

    if (current_id && current_id !== +organizer_id) {
      literal = [
        [
          sequelize.literal(
            `CASE WHEN EXISTS (SELECT 1 FROM follow WHERE follower_id = ${current_id} AND followed_id = ${organizer_id}) THEN true ELSE false END`,
          ),
          "is_following",
        ],
      ];
      literal.push([
        sequelize.literal(
          `CASE WHEN EXISTS (SELECT 1 FROM friendship WHERE (sender_id = ${current_id} AND receiver_id = ${organizer_id}) OR (sender_id = ${organizer_id} AND receiver_id = ${current_id})) THEN true ELSE false END`,
        ),
        "is_friend",
      ]);
      //search for the current user in the friend request table as sender_id
      literal.push([
        sequelize.literal(
          `CASE WHEN EXISTS (SELECT 1 FROM friend_request WHERE sender_id = ${current_id} AND receiver_id = ${organizer_id}) THEN true ELSE false END`,
        ),
        "sent_request",
      ]);
    }

    return Person.findByPk(organizer_id, {
      include: [
        {
          model: User,
          required: true,
          attributes: [],
          include: [
            {
              model: Organizer,
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
        [sequelize.col("User.Organizer.rate"), "rate"],
        [sequelize.col("User.Organizer.bio"), "bio"],
        [sequelize.col("User.Organizer.events_count"), "events_count"],
        [sequelize.col("User.UserImages.Image.url"), "profile_image"],
        ...(literal?.length ? literal : []),
      ],
    });
  }
  public async getOrganizerEvents(
    organizer_id: number,
    apifeatures: APIFeatures,
  ): Promise<Post[] | null> {
    return Post.findAll({
      where: { organizer_id, status: "published" },
      include: [
        {
          model: Event,
          required: true,
          attributes: [],
          include: [
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
      attributes: [
        [sequelize.col("Event.id"), "event_id"],
        "content",
        [
          sequelize.fn(
            "to_char",
            sequelize.col("Event.date"),
            "YYYY-MM-DD HH24:MI:SS",
          ),
          "date",
        ],
        [sequelize.col("Event.location"), "location"],
        [sequelize.col("Event.time"), "time"],
        [sequelize.col("Event.EventImages.Image.url"), "image_url"],
      ],
      ...apifeatures.query,
      subQuery: false,
    });
  }
}
