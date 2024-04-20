import { Request } from "express";
import { sequelize } from "../../database";
import Event from "../event/event.model";
import EventImage from "../image/event.image.model";
import Image from "../image/image.model";
import Organizer from "../organizer/organizer.model";
import Person from "../person/person.model";
import Post from "../post/post.model";
import User from "../user/user.model";
import axios from "axios";
import { FindAttributeOptions, Includeable, Op } from "sequelize";
import { Literal } from "sequelize/types/utils";

//   {
//     model: Post,
//     required: true,
//     attributes: [],
//     include: [
//       {
//         model: Organizer,
//         required: true,
//         attributes: [],
//         include: [
//           {
//             model: User,
//             required: true,
//             attributes: [],
//             include: [
//               {
//                 model: Person,
//                 required: true,
//                 attributes: [],
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
//   {
//     model: EventImage,
//     required: true,
//     attributes: [],
//     include: [
//       {
//         model: Image,
//         required: true,
//         attributes: [],
//       },
//     ],
//   },
// ];
export class FeedService {
  private readonly includes: Includeable[];
  private readonly attributes: FindAttributeOptions;
  constructor() {
    this.includes = [
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
    this.attributes = [
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
  }
  public async get_home_events(req: Request): Promise<Event[]> {
    const recommendations = await this.recommendations_events(
      req.user?.id as number,
      req.headers["x-access-token"] as string,
    );
    const events_ids: number[] = recommendations.data;
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
      include: this.includes,
      attributes: [
        ...(this.attributes as unknown as []),
        ...(literal.length ? literal : []),
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
  public async random_events(): Promise<Event[]> {
    return Event.findAll({
      include: this.includes,
      attributes: this.attributes,
      where: {
        "$Post.status$": "published",
      },
      order: sequelize.random(),
      limit: 20,
      subQuery: false,
    });
  }
  private async recommendations_events(user_id: number, token: string) {
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
}
