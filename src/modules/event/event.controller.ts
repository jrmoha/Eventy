import { NextFunction, Request, Response } from "express";
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
import { CreateEventInput } from "./event.validator";

export const get = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    const event = await Event.findByPk(id, {
      include: [
        {
          model: Event_Phone,
        },
        {
          model: Ticket,
        },
        {
          model: Event_Agenda,
        },
        {
          model: EventCategory,
        },
        {
          model: EventFAQ,
        },
        {
          model: EventImage,
        },
        {
          model: Community,
          include: [CommunityMembership],
        },
      ],
    });
    res.status(StatusCodes.OK).json({ success: true, data: event });
  },
);

export const create = async_(
  async (
    req: Request<{}, {}, CreateEventInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const t = await sequelize.transaction();
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
        date,
        time,
      },
      { transaction: t },
    );

    const event_phone_numbers = await Event_Phone.bulkCreate(
      phone_numbers.map((phone: string) => ({
        event_id: event.id,
        phone,
      })),
      { transaction: t },
    );

    const event_agenda = await Event_Agenda.bulkCreate(
      agenda.map((agenda) => ({
        event_id: event.id,
        description: agenda.description,
        start_time: agenda.start_time,
        end_time: agenda.end_time,
      })),
      { transaction: t },
    );

    if (allow_community) {
      const community = await Community.create(
        {
          id: event.id,
        },
        { transaction: t },
      );

      await CommunityMembership.create(
        {
          community_id: community.id,
          user_id
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

    for (const category of categories) {
      const exists = await Category.findOne({
        where: {
          name: sequelize.where(
            sequelize.fn("LOWER", sequelize.col("name")),
            "LIKE",
            category.toLowerCase(),
          ),
        },
      });

      if (exists) {
        await EventCategory.findOrCreate({
          where: {
            event_id: event.id,
            category: exists.name,
          },
          defaults: {
            event_id: event.id,
            category: exists.name,
          },
          transaction: t,
        });
      } else {
        const new_category = await Category.create(
          {
            name: category,
          },
          { transaction: t },
        );

        await EventCategory.create(
          {
            event_id: event.id,
            category: new_category.name,
          },
          { transaction: t },
        );
      }
    }
    for (const faq of faqs) {
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
            folder: `eventy/events/${event.id}`,
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

    await t.commit();
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        event,
        post,
        organizer,
        event_phone_numbers,
        event_agenda,
        event_tickets,
        event_images,
        images: images_array,
      },
    });
  },
);
