import { Literal } from "sequelize/types/utils";
import { sequelize } from "../../database";
import EventCategory from "./category/event.category.model";
import EventImage from "./image/event.image.model";
import Image from "../image/image.model";
import Organizer from "../organizer/organizer.model";
import Person from "../person/person.model";
import Post from "../post/post.model";
import User from "../user/user.model";
import Event_Agenda from "./agenda/agenda.model";
import EventFAQ from "./faq/faq.model";
import Event_Phone from "./phone/phone.model";
import Event from "./event.model";
import axios from "axios";
import { Op, Transaction } from "sequelize";

export class EventService {
  constructor() {}

  public async saveEvent(event: Event, t?: Transaction): Promise<Event> {
    await event.save({ transaction: t });
    return event;
  }
  public async todaysEvents(): Promise<Event[]> {
    const todayDate = new Date();
    const formattedTodayDate = todayDate.toISOString().split("T")[0];

    return Event.findAll({
      where: {
        date: {
          [Op.eq]: formattedTodayDate,
        },
      },
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
        {
          model: Event_Agenda,
          required: false,
        },
      ],
      attributes: [
        "id",
        "location",
        "date",
        "time",
        [sequelize.col("Post.content"), "content"],
        [sequelize.col("EventImages.Image.secure_url"), "cover"],
      ],
    });
  }
  public async getEvent(
    id: number,
    user_id: number | undefined,
  ): Promise<Post | null> {
    let literal!: [[Literal, string]];
    if (user_id) {
      literal = [
        [
          sequelize.literal(
            `CASE WHEN EXISTS (SELECT 1 FROM likes WHERE event_id = ${id} AND user_id = ${user_id}) THEN true ELSE false END`,
          ),
          "is_liked",
        ],
      ];
      literal.push([
        sequelize.literal(
          `CASE WHEN EXISTS (SELECT 1 FROM event_interest WHERE event_id = ${id} AND user_id = ${user_id}) THEN true ELSE false END`,
        ),
        "is_interested",
      ]);
    }
    return Post.findByPk(id, {
      attributes: ["id", "content"],
      include: [
        {
          model: Organizer,
          include: [
            {
              model: User,
              attributes: [],
              include: [
                {
                  model: Person,
                  required: true,
                  attributes: [],
                },
              ],
              required: true,
            },
          ],
          attributes: [
            [
              sequelize.literal('"Organizer->User->Person".first_name'),
              "first_name",
            ],
            [
              sequelize.literal('"Organizer->User->Person".last_name'),
              "last_name",
            ],
            [
              sequelize.literal('"Organizer->User->Person".username'),
              "username",
            ],
            [
              sequelize.literal('"Organizer->User".followers_count'),
              "followers_count",
            ],
            [sequelize.literal('"Organizer".rate'), "rate"],
            [sequelize.literal('"Organizer".events_count'), "events_count"],
          ],
        },
        {
          model: Event,
          required: true,
          attributes: [
            "location",
            "date",
            "time",
            "likes_count",
            "interests_count",
            "attendees_count",
            ...(literal ? literal : []),
          ],
          include: [
            {
              model: EventCategory,
              attributes: ["category"],
            },
            {
              model: EventImage,
              include: [
                {
                  model: Image,
                  required: true,
                  attributes: [],
                },
              ],
              attributes: [
                [
                  sequelize.literal('"Event->EventImages->Image".public_id'),
                  "public_id",
                ],
                [sequelize.literal('"Event->EventImages->Image".url'), "url"],
                [
                  sequelize.literal('"Event->EventImages->Image".secure_url'),
                  "secure_url",
                ],
              ],
            },
            {
              model: Event_Phone,
              attributes: ["phone"],
            },
            {
              model: EventFAQ,
              attributes: ["question", "answer"],
            },
            {
              model: Event_Agenda,
              attributes: ["description", "start_time", "end_time"],
            },
          ],
        },
      ],
    });
  }
  public async getSimilarEvents(
    id: number,
    token: string,
  ): Promise<Post[] | null> {
    const similarEventsIds = await this.fetchSimilarEventsIds(id, token);
    if (!similarEventsIds) return null;

    return Post.findAll({
      where: {
        id: {
          [Op.in]: similarEventsIds,
        },
        status: "published",
      },
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
        "id",
        "content",
        [sequelize.col("Event.EventImages.Image.secure_url"), "image_url"],
      ],
      order: sequelize.random(),
      limit: 10,
      subQuery: false,
    }) as unknown as Post[] | null;
  }

  private async fetchSimilarEventsIds(
    id: number,
    token: string,
  ): Promise<number[] | null> {
    const response = await axios.post(
      "http://localhost:8000/event",
      { elementid: id },
      {
        headers: {
          Authorization: token.split(" ")[1],
        },
      },
    );
    return response.data as number[] | null;
  }
}
