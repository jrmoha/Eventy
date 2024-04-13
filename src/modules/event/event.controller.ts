// import config from "config";
import { NextFunction, Request, Response } from "express";
import fs from "fs";
import { sequelize } from "../../database";
import { async_ } from "../../interfaces/middleware/async.middleware";
import Post from "../post/post.model";
import Organizer from "../organizer/organizer.model";
import Event from "./event.model";
import Event_Phone from "./event.phone.model";
import Event_Agenda from "./event.agenda.model";
import Community from "../community/community.model";
import CommunityMembership from "../community/community.membership.model";
import Ticket from "./event.tickets.model";
import Category from "../category/category.model";
import EventCategory from "../category/event.category.model";
import EventFAQ from "./event.faq.model";
import cloudinary from "../../utils/cloudinary";
import Image from "../image/image.model";
import EventImage from "../image/event.image.model";
import StatusCodes from "http-status-codes";
import { CreateEventInput, InterestInput } from "./event.validator";
import { APIError } from "../../types/APIError.error";
import Person from "../person/person.model";
import User from "../user/user.model";
import Event_Interest from "./event.interest.model";
import { Literal } from "sequelize/types/utils";
// import { RedisService } from "../../cache";

export const create = async_(
  async (
    req: Request<{}, {}, CreateEventInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const t = await sequelize.transaction();
    req.transaction = t;

    const user_id = req.user?.id;
    const {
      content,
      location,
      date,
      time,
      phone_numbers,
      agenda,
      allow_community,
      tickets,
      categories,
      faqs,
    } = req.body;

    const categories_set = new Set(Array.isArray(categories) ? categories : []);
    const phone_numbers_set = new Set(
      Array.isArray(phone_numbers) ? phone_numbers : [],
    );

    const images = req.files as Express.Multer.File[];

    const organizer = await Organizer.findOrCreate({
      where: { id: user_id },
      defaults: {
        id: user_id,
      },
      transaction: t,
    });

    const post = await Post.create(
      {
        content,
        organizer_id: user_id,
      },
      { transaction: t },
    );

    const event = await Event.create(
      {
        id: post.id,
        location,
        date: new Date(date),
        time,
      },
      { transaction: t },
    );

    const event_phone_numbers = await Event_Phone.bulkCreate(
      [...phone_numbers_set].map((phone: string) => ({
        event_id: event.id,
        phone,
      })),
      { transaction: t },
    );

    if (agenda) {
      await Event_Agenda.bulkCreate(
        agenda.map((agenda) => ({
          event_id: event.id,
          description: agenda.description,
          start_time: agenda.start_time,
          end_time: agenda.end_time,
        })),
        { transaction: t },
      );
    }

    if (allow_community) {
      const community = await Community.create(
        {
          id: event.id,
          name: content,
        },
        { transaction: t },
      );

      await CommunityMembership.create(
        {
          community_id: community.id,
          user_id,
          role: "admin",
        },
        { transaction: t },
      );
    }
    const event_tickets = await Ticket.bulkCreate(
      tickets.map((ticket) => ({
        event_id: event.id,
        price: ticket.price,
        class: ticket.class,
        quantity: ticket.quantity,
        available: ticket.available,
      })),
      { transaction: t },
    );

    for (const category of categories_set) {
      const category_exists = await Category.findOne({
        where: sequelize.where(
          sequelize.fn("lower", sequelize.col("name")),
          "=",
          category.toLowerCase(),
        ),
      });
      if (category_exists) {
        await EventCategory.findOrCreate({
          where: {
            event_id: event?.id,
            category: category_exists.name,
          },
          defaults: {
            event_id: event?.id,
            category: category_exists.name,
          },
          transaction: t,
        });
      } else {
        const formattedCategoryName =
          category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
        const category_ = await Category.create(
          { name: formattedCategoryName },
          { transaction: t },
        );
        await EventCategory.create(
          { event_id: event.id, category: category_.name },
          { transaction: t },
        );
      }
    }

    for (const faq of faqs || []) {
      await EventFAQ.create(
        {
          event_id: event.id,
          question: faq.question,
          answer: faq.answer,
        },
        { transaction: t },
      );
    }

    const images_array = await Promise.all(
      images.map(async (img: Express.Multer.File) => {
        const { public_id, secure_url, url } = await cloudinary.uploader.upload(
          img.path,
          {
            folder: `eventy/posts/events/${event.id}`,
            resource_type: "image",
          },
        );
        const image = await Image.create(
          {
            public_id,
            secure_url,
            url,
            size: img.size,
            format: img.mimetype,
          },
          { transaction: t },
        );
        fs.unlinkSync(img.path);
        return image;
      }),
    );
    const event_images = await EventImage.bulkCreate(
      images_array.map((image: Image) => ({
        event_id: event.id,
        public_id: image.public_id,
      })),
      { transaction: t },
    );

    organizer[0].events_count++;
    await organizer[0].save({ transaction: t });
    console.log(`post id: ${post.id}`);

    await t.commit().then(() => {
      console.log("Transaction committed");
      Event.update({ id: post.id }, { where: { id: post.id } }).then(() => {
        //mock update to trigger trigger
        console.log("Event updated");
      });
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        event,
        post,
        organizer,
        event_phone_numbers,
        event_tickets,
        event_images,
        images: images_array,
      },
    });
  },
);
export const get = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);

    let literal!: [[Literal, string]];
    if (req.user?.id) {
      literal = [
        [
          sequelize.literal(
            `CASE WHEN EXISTS (SELECT 1 FROM likes WHERE event_id = ${id} AND user_id = ${req.user?.id}) THEN true ELSE false END`,
          ),
          "is_liked",
        ],
      ];
      literal.push([
        sequelize.literal(
          `CASE WHEN EXISTS (SELECT 1 FROM event_interest WHERE event_id = ${id} AND user_id = ${req.user?.id}) THEN true ELSE false END`,
        ),
        "is_interested",
      ]);
    }

    const event = await Post.findByPk(id, {
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
            "comments_count",
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

    if (!event) throw new APIError("Event not found", StatusCodes.NOT_FOUND);

    event.dataValues.Event.dataValues.date = new Date(
      event.dataValues.Event.dataValues.date,
    ).toDateString();

    //TODO: uncomment
    //*********** Cache the event ***********
    /**const redisClient = new RedisService().Client;
    let key = `Event:${id}`;
    if (req.user) key += `:User:${req.user.id}`;
    await redisClient.set(
      key,
      JSON.stringify(event),
      "EX",
      config.get<number>("redis.ex"),
    );
    */

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        post: event,
      },
    });
  },
);

export const interest = async_(
  async (
    req: Request<InterestInput, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    const { id } = req.params;
    const user_id = req.user?.id;
    const event = await Event.findByPk(id);
    if (!event) throw new APIError("Event not found", StatusCodes.NOT_FOUND);

    const already_interested = await Event_Interest.findOne({
      where: {
        event_id: id,
        user_id,
      },
    });

    if (already_interested) {
      await already_interested.destroy();
      event.interests_count--;
    } else {
      await Event_Interest.create({
        event_id: id,
        user_id,
      });
      event.interests_count++;
    }
    await event.save();
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        event,
      },
    });
  },
);
