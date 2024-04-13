import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import Event from "../event/event.model";
import Post from "../post/post.model";
import { sequelize } from "../../database";
import { APIError } from "../../types/APIError.error";
import { StatusCodes } from "http-status-codes";
import Organizer from "../organizer/organizer.model";
import User from "../user/user.model";
import { Op } from "sequelize";
import AnalyticsService from "./analytics.service";

export const overview = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const organizer_id = req.user?.id;
    const from_date = req.query.from as string;
    const to_date = req.query.to as string;

    const organizer = await Organizer.findByPk(organizer_id, {
      include: [
        {
          model: User,
          required: true,
          attributes: [],
        },
      ],
      attributes: [
        "id",
        "rate",
        "rates_count",
        "events_count",
        [sequelize.col("User.followers_count"), "followers_count"],
      ],
    });
    if (!organizer)
      throw new APIError("Organizer not found", StatusCodes.NOT_FOUND);

    const analyticsService = new AnalyticsService(from_date, to_date);
    const promises = [
      analyticsService.postsCount(organizer.id),
      analyticsService.eventsCount(organizer.id),
      analyticsService.newFollowersCount(organizer.id),
      analyticsService.pollsCount(organizer.id),
    ];
    const [posts_count, events_count, new_followers_count, polls_count] =
      await Promise.all(promises);

    const data = {
      rate: organizer?.rate,
      rates_count: organizer?.rates_count,
      followers_count: organizer?.followers_count,
      posts_count,
      events_count,
      polls_count,
      new_followers_count,
    };

    //TODO: add tickets sold
    return res.status(StatusCodes.OK).json({ success: true, data });
  },
);

export const eventAnalytics = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const organizer_id = req.user?.id;
    const { event_id } = req.params;
    const { from, to } = req.query as { from: string; to: string };

    const event = await Event.findByPk(event_id, {
      include: [
        {
          model: Post,
          required: true,
          attributes: [],
        },
      ],
      attributes: ["id", [sequelize.col("Post.organizer_id"), "organizer_id"]],
    });

    if (!event) throw new APIError("Event not found", StatusCodes.NOT_FOUND);

    if (event.organizer_id !== organizer_id)
      throw new APIError("Unauthorized", StatusCodes.UNAUTHORIZED);

    const analyticsService = new AnalyticsService(from, to);

    const promises = [
      analyticsService.likes(event.id),
      analyticsService.interests(event.id),
    ];
    const [likes, interests] = await Promise.all(promises);

    const data = {
      likes_count: likes[0],
      likes: likes[1],
      interests_count: interests[0],
      interests: interests[1],
    };

    return res.status(StatusCodes.OK).json({ success: true, data });
  },
);

export const searchPosts = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { q } = req.query;
    const organizer_id = req.user?.id;

    const posts = await Post.findAll({
      where: {
        organizer_id,
        status: "published",
      },
      include: [
        {
          model: Event,
          required: false,
          where: {
            search: {
              [Op.match]: sequelize.fn("websearch_to_tsquery", "english", q),
            },
          },
          attributes: [],
        },
      ],
    });

    return res.status(StatusCodes.OK).json({ success: true, data: posts });
  },
);
