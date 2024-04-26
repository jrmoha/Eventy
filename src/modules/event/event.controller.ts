import { FAQService } from "./faq/faq.service";
import { EventPhoneService } from "./phone/phone.service";
import { AgendaService } from "./agenda/agenda.service";
import { ImageService } from "./../image/image.service";
import { EventCategoryService } from "./category/category.service";
import { TicketService } from "./tickets/ticket.service";
import { CommunityMembershipService } from "../community/membership/community.membership.service";
import { CommunityService } from "./../community/community.service";
import { PostService } from "./../post/post.service";
import { OrganizerService } from "./../organizer/organizer.service";
import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import Post from "../post/post.model";
import Event from "./event.model";
import Community from "../community/community.model";
import CommunityMembership from "../community/membership/community.membership.model";
import StatusCodes from "http-status-codes";
import { CreateEventInput, InterestInput } from "./event.validator";
import { APIError } from "../../error/api-error";
import Event_Interest from "./interest/event.interest.model";
import { CacheKeysGenerator } from "../../utils/cache_keys_generator";
import { RedisService } from "../../cache";
import { EventService } from "./event.service";
import { sequelize } from "../../database";
import logger from "../../utils/logger";
import { EventImageService } from "./image/event.image.service";

export const create = async_(
  async (
    req: Request<{}, {}, CreateEventInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const t = await sequelize.transaction();
    req.transaction = t;

    const user_id = req.user?.id;
    if (!user_id) throw new APIError("User not found", StatusCodes.NOT_FOUND);

    const OrganizerServiceInstance = new OrganizerService();
    const [organizer] = await OrganizerServiceInstance.insertIfNotExists(
      user_id,
      t,
    );
    const { content } = req.body;
    const PostServiceInstance = new PostService();
    const postInstance = new Post({ content, organizer_id: user_id });
    const post = await PostServiceInstance.savePost(postInstance, t);

    const { location, date, time } = req.body;
    const EventServiceInstance = new EventService();
    const eventInstance = new Event({
      id: post.id,
      location,
      date: new Date(date),
      time,
    });
    const event = await EventServiceInstance.saveEvent(eventInstance, t);

    const { phone_numbers } = req.body;
    const EventPhoneServiceInstance = new EventPhoneService();
    await EventPhoneServiceInstance.insertPhoneNumbers(event, phone_numbers, t);

    const { agenda } = req.body;
    if (agenda) {
      const AgendaServiceInstance = new AgendaService();
      await AgendaServiceInstance.insertAgenda(event, agenda, t);
    }
    const { allow_community } = req.body;
    if (allow_community) {
      const CommunityServiceInstance = new CommunityService();
      const communityInstance = new Community({ id: event.id, name: content });
      const community = await CommunityServiceInstance.saveCommunity(
        communityInstance,
        t,
      );

      const CommunityMembershipServiceInstance =
        new CommunityMembershipService();
      const communityMembershipInstance = new CommunityMembership({
        community_id: community.id,
        user_id,
        role: "admin",
      });
      await CommunityMembershipServiceInstance.addMember(
        communityMembershipInstance,
        t,
      );
    }
    const { tickets } = req.body;
    const TicketServiceInstance = new TicketService();
    await TicketServiceInstance.saveTickets(tickets, event, t);

    const { categories } = req.body;
    const CategoryServiceInstance = new EventCategoryService();
    await CategoryServiceInstance.bulkCreateCategories(categories, event, t);

    const { faqs } = req.body;
    const FAQServiceInstance = new FAQService();
    await FAQServiceInstance.insertFAQs(faqs, event, t);

    const ImageServiceInstance = new ImageService();
    const images_array = await ImageServiceInstance.uploadEventImages(
      req.files as Express.Multer.File[],
      event,
      t,
    );
    const EventImageServiceInstance = new EventImageService();
    await EventImageServiceInstance.insertImages(images_array, event, t);

    organizer.events_count++;
    await organizer.save({ transaction: t });

    await t.commit().then(() => {
      console.log("Transaction committed");
      Event.update({ id: post.id }, { where: { id: post.id } }).then(() => {
        logger.info("Event updated"); //mock update to trigger trigger
      });
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        event,
      },
    });
  },
);
export const get = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);

    const EventServiceInstance = new EventService();
    const event = await EventServiceInstance.getEvent(id, req.user?.id);

    if (!event) throw new APIError("Event not found", StatusCodes.NOT_FOUND);

    event.dataValues.Event.dataValues.date = new Date(
      event.dataValues.Event.dataValues.date,
    ).toDateString();

    //*********** Cache the event ***********
    const redisClient = new RedisService();
    const key: string = new CacheKeysGenerator().keysGenerator["event"](req);
    await redisClient.set(key, { post: event });

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

export const similar_events = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const EventServiceInstance = new EventService();
    const events = await EventServiceInstance.getSimilarEvents(
      +id,
      req.headers["x-access-token"] as string,
    );
    if (!events) return null;

    //*********** Cache the event ***********
    const redisClient = new RedisService();
    const key: string = new CacheKeysGenerator().keysGenerator["similarEvents"](
      req,
    );
    await redisClient.set(key, events);

    return res.status(StatusCodes.OK).json({ success: true, data: events });
  },
);

export const tickets = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const TicketServiceInstance = new TicketService();
    const tickets = await TicketServiceInstance.getTickets(+id);

    return res.status(StatusCodes.OK).json({ success: true, data: tickets });
  },
);
