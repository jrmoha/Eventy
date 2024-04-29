import { Request } from "express";
import { sequelize } from "../../database";
import Event from "../event/event.model";
import EventImage from "../event/image/event.image.model";
import Image from "../image/image.model";
import Organizer from "../organizer/organizer.model";
import Person from "../person/person.model";
import Post from "../post/post.model";
import User from "../user/user.model";
import axios from "axios";
import { FindAttributeOptions, Includeable, Op } from "sequelize";
import { Literal } from "sequelize/types/utils";
import UserImage from "../user/image/user.image.model";
import SystemImage from "../image/system.image.model";
import config from "config";
export class FeedService {
  constructor() {}
  public async get_home_covers(): Promise<Image[]> {
    return SystemImage.findAll({
      include: [{ model: Image, required: true, attributes: [] }],
      attributes: [[sequelize.col("Image.url"), "url"]],
      order: [["createdAt", "DESC"]],
      limit: config.get<number>("images.covers_max_length"),
    });
  }
  public async get_home_organizers(req: Request): Promise<Person[]> {
    let is_followed_literal!: [Literal, string];
    if (req.user) {
      is_followed_literal = [
        sequelize.literal(
          `CASE WHEN EXISTS (SELECT * FROM follow WHERE follower_id = ${req.user?.id} AND followed_id = "Organizer".id) THEN true ELSE false END`,
        ),
        "is_followed",
      ];
    }
    return User.findAll({
      include: [
        { model: Person, required: true, attributes: [] },
        {
          model: Organizer,
          required: true,
          attributes: [],
        },
        {
          model: UserImage,
          required: true,
          attributes: [],
          include: [
            {
              model: Image,
              required: true,
              attributes: [],
            },
          ],
          where: { is_profile: true },
        },
      ],
      attributes: [
        "id",
        "followers_count",
        [sequelize.col("Person.first_name"), "first_name"],
        [sequelize.col("Person.last_name"), "last_name"],
        [sequelize.col("Person.email"), "email"],
        [sequelize.col("Organizer.bio"), "bio"],
        [sequelize.col("Organizer.rate"), "rate"],
        [sequelize.col("Organizer.events_count"), "events_count"],
        [sequelize.col("UserImages.Image.url"), "image"],
        ...(is_followed_literal?.length ? [is_followed_literal] : []),
      ],
      subQuery: false,
    });
  }
  private async get_home_events(req: Request): Promise<Event[]> {
    const includes: Includeable[] = [
      {
        model: Post,
        required: true,
        attributes: [],
        include: [
          {
            model: Organizer,
            required: true,
            attributes: [],
            include: [
              {
                model: User,
                required: true,
                attributes: [],
                include: [
                  {
                    model: Person,
                    required: true,
                    attributes: [],
                  },
                ],
              },
            ],
          },
        ],
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
    ];
    const attributes: FindAttributeOptions = [
      "id",
      "location",
      "date",
      "time",
      [sequelize.col("Post.content"), "content"],
      [sequelize.col("Post.status"), "status"],
      [sequelize.col("Post.Organizer.rate"), "rate"],
      [
        sequelize.fn(
          "concat",
          sequelize.col("Post.Organizer.User.Person.first_name"),
          " ",
          sequelize.col("Post.Organizer.User.Person.last_name"),
        ),
        "organizer_name",
      ],
      [sequelize.col("Post.Organizer.User.followers_count"), "followers_count"],
      [sequelize.col("EventImages.Image.secure_url"), "image"],
    ];
    const recommendations = await this.fetch_recommendations_events(
      req.user?.id as number,
      req.headers["x-access-token"] as string,
    );
    const events_ids: number[] = recommendations.data;
    if (!events_ids?.length) return this.random_events();
    const literal: [[Literal, string], [Literal, string]] = [
      [
        sequelize.literal(
          `EXISTS (SELECT 1 FROM likes WHERE event_id = "Post"."id" AND user_id = ${req.user?.id})`,
        ),
        "is_liked",
      ],
      [
        sequelize.literal(
          `EXISTS (SELECT 1 FROM event_interest WHERE event_id = "Post"."id" AND user_id = ${req.user?.id})`,
        ),
        "is_interested",
      ],
    ];

    return Event.findAll({
      include: includes,
      attributes: [
        ...(attributes as unknown as []),
        ...(literal?.length ? literal : []),
      ],
      where: {
        id: {
          [Op.in]: events_ids,
        },
        "$Post.status$": "published",
      },
      limit: 20,
      subQuery: false,
    }) as Promise<Event[]>;
  }
  private async random_events(): Promise<Event[]> {
    const includes: Includeable[] = [
      {
        model: Post,
        required: true,
        attributes: [],
        include: [
          {
            model: Organizer,
            required: true,
            attributes: [],
            include: [
              {
                model: User,
                required: true,
                attributes: [],
                include: [
                  {
                    model: Person,
                    required: true,
                    attributes: [],
                  },
                ],
              },
            ],
          },
        ],
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
    ];
    const attributes: FindAttributeOptions = [
      "id",
      "location",
      "date",
      "time",
      [sequelize.col("Post.content"), "content"],
      [sequelize.col("Post.status"), "status"],
      [sequelize.col("Post.Organizer.rate"), "rate"],
      [
        sequelize.fn(
          "concat",
          sequelize.col("Post.Organizer.User.Person.first_name"),
          " ",
          sequelize.col("Post.Organizer.User.Person.last_name"),
        ),
        "organizer_name",
      ],
      [sequelize.col("Post.Organizer.User.followers_count"), "followers_count"],
      [sequelize.col("EventImages.Image.secure_url"), "image"],
    ];
    return Event.findAll({
      include: includes,
      attributes,
      where: {
        "$Post.status$": "published",
      },
      order: sequelize.random(),
      limit: 20,
      subQuery: false,
    });
  }
  private async fetch_recommendations_events(user_id: number, token: string) {
    const response = await axios.post(
      "http://localhost:8000/user",
      { elementid: user_id },
      {
        headers: {
          Authorization: token.split(" ")[1],
          "Content-Type": "application/json",
        },
      },
    );
    return response;
  }

  public async get_feed_events(req: Request): Promise<Event[]> {
    if (req.user) return this.get_home_events(req);
    return this.random_events();
  }
}
