/* eslint-disable @typescript-eslint/no-explicit-any */
import { authenticate } from "./../../interfaces/middleware/authentication.middleware";
import { Request, Response, Router } from "express";
import * as EventController from "./event.controller";
import upload from "../../cloud/multer";
import config from "config";
import { validate } from "../../interfaces/middleware/validator.middleware";
import { createEventSchema, interestSchema } from "./event.validator";
import likeRoutes from "../like/like.routes";
import searchRoutes from "../search/search.routes";
import rateRoutes from "../rate/rate.routes";
import { cache } from "../../interfaces/middleware/cache.middleware";
import { async_ } from "../../interfaces/middleware/async.middleware";
import Post from "../post/post.model";
import Event from "./event.model";
import Event_Phone from "./phone/phone.model";
import Event_Agenda from "./agenda/agenda.model";
import EventFAQ from "./faq/faq.model";
import Ticket from "./tickets/event.tickets.model";
import cloudinary from "../../cloud/cloudinary";
import Image from "../image/image.model";
import { sequelize } from "../../database";
import fs from "fs";
import EventCategory from "./category/event.category.model";
import EventImage from "./image/event.image.model";
import { RedisService } from "../../cache";
import { Op } from "sequelize";
import CommunityMembership from "../community/membership/community.membership.model";
import Community from "../community/community.model";
import CommunityMessage from "../community/message/community.message.model";
import Like from "../like/like.model";
import Event_Interest from "./interest/event.interest.model";
import Rate from "../rate/rate.model";
import Attendance from "../attendance/attendance.model";

const router = Router();

router.use("/search", searchRoutes);
router.use("/:event_id", likeRoutes);
router.use("/:event_id", rateRoutes);

router.post(
  "/create",
  authenticate(false, "o", "u"),
  upload("image", "images").array(
    "images",
    config.get<number>("maxImageCount"),
  ),
  validate(createEventSchema),
  EventController.create,
);
router.get(
  "/event/:id",
  authenticate(true, "u", "o"),
  cache("event"),
  EventController.get,
);
router.post(
  "/:id/interest",
  authenticate(false, "o", "u"),
  validate(interestSchema),
  EventController.interest,
);
router.get(
  "/similar/:id",
  authenticate(true, "o", "u"),
  cache("similarEvents"),
  EventController.similar_events,
);
router.get(
  "/tickets/:id",
  authenticate(true, "o", "u"),
  EventController.tickets,
);
//from here
router.patch(
  "/events/update/:id",
  upload("image", "images").array(
    "images",
    config.get<number>("maxImageCount"),
  ),
  async_(async (req: Request, res: Response) => {
    const content = "Oppenheimer File Premiere";
    const faqs = [
      {
        question: "What is the event about?",
        answer: "It's a movie premiere",
      },
      {
        question: "Is there a dress code?",
        answer: "Formal attire",
      },
    ];

    const tickets = [
      {
        price: 100,
        class: "VIP",
        available: 100,
      },
      {
        price: 50,
        class: "Regular",
        available: 200,
      },
    ];

    const agenda = [
      {
        description: "Registration",
        start_time: "09:00 AM",
        end_time: "10:00 AM",
      },
      {
        description: "Opening Ceremony",
        start_time: "10:00 AM",
        end_time: "13:00 PM",
      },
       
    ];

    const date = "2024-06-25";
    const time = "09:00 AM to 13:00 PM";

    const categories = ["Art","Science","Theatre","Film","Outdoor"];

    const location = "Alexandria, Egypt";
    const t = await sequelize.transaction();
    const { id } = req.params;
    await Post.update({ content }, { where: { id }, transaction: t });
    await Event.update(
      { location, date, time },
      { where: { id }, transaction: t },
    );
    const phone_numbers = ["01000000000", "01111111111"];
    await Event_Phone.destroy({ where: { event_id: id }, transaction: t });
    await Event_Phone.bulkCreate(
      phone_numbers.map((phone_number: string) => ({
        phone: phone_number,
        event_id: id,
      })),
      { transaction: t },
    );

    await Event_Agenda.destroy({ where: { event_id: id }, transaction: t });
    await Event_Agenda.bulkCreate(
      agenda.map((agenda: any) => ({
        description: agenda.description,
        start_time: agenda.start_time,
        end_time: agenda.end_time,
        event_id: id,
      })),
      { transaction: t },
    );

    await EventFAQ.destroy({ where: { event_id: id }, transaction: t });
    await EventFAQ.bulkCreate(
      faqs.map((faq: any) => ({
        question: faq.question,
        answer: faq.answer,
        event_id: id,
      })),
      { transaction: t },
    );

    await Ticket.destroy({ where: { event_id: id }, transaction: t });
    await Ticket.bulkCreate(
      tickets.map((ticket: any) => ({
        price: ticket.price,
        class: ticket.class,
        available: ticket.available,
        event_id: id,
      })),
      { transaction: t },
    );
    const images = req.files as Express.Multer.File[];
    const event_images = await Promise.all(
      images.map(async (img: Express.Multer.File) => {
        const { public_id, secure_url, url } = await cloudinary.uploader.upload(
          img.path,
          {
            folder: `eventy/posts/events/${id}`,
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
    await EventImage.destroy({ where: { event_id: id }, transaction: t });
    await EventImage.bulkCreate(
      event_images.map((image: any) => ({
        public_id: image.public_id,
        event_id: id,
      })),
      { transaction: t },
    );
    await EventCategory.destroy({ where: { event_id: id }, transaction: t });
    await EventCategory.bulkCreate(
      categories.map((category: string) => ({
        category,
        event_id: id,
      })),
      { transaction: t, ignoreDuplicates: true },
    );
    await t.commit().then(async () => {
      await new RedisService().Client.del(`Event:${id}`);
      return res.status(200).json({ message: "Event updated successfully" });
    }),
      (err: never) => {
        return res.status(400).json({ message: "Event update failed" });
      };
  }),
);
router.delete("/",async_(async (req: Request, res: Response) => {
  //delete every event with id > 87
  // await Event.destroy({ where: { id: { [Op.gt]: 87 } } });
  await Attendance.destroy({ where: { event_id: { [Op.gt]: 87 } } });
  await Rate.destroy({ where: { event_id: { [Op.gt]: 87 } } });
  await Like.destroy({ where: { event_id: { [Op.gt]: 87 } } });
await Event_Interest.destroy({ where: { event_id: { [Op.gt]: 87 } } });
  await CommunityMessage.destroy({ where: { community_id: { [Op.gt]: 87 } } });
  await CommunityMembership.destroy({ where: { community_id: { [Op.gt]: 87 } } });
  await Community.destroy({ where: { id: { [Op.gt]: 87 } } });
  await EventImage.destroy({ where: { event_id: { [Op.gt]: 87 } } });
  await Ticket.destroy({ where: { event_id: { [Op.gt]: 87 } } });
  await EventFAQ.destroy({ where: { event_id: { [Op.gt]: 87 } } });
  await Event_Agenda.destroy({ where: { event_id: { [Op.gt]: 87 } } });
  await Event_Phone.destroy({ where: { event_id: { [Op.gt]: 87 } } });
  await EventCategory.destroy({ where: { event_id: { [Op.gt]: 87 } } });
  await Event.destroy({ where: { id: { [Op.gt]: 87 } } });
  await Post.destroy({ where: { id: { [Op.gt]: 87 } } });
  return res.status(200).json({ message: "Events deleted successfully" });
}));
export default router;
