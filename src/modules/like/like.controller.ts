import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import Event from "../event/event.model";
import { APIError } from "../../error/api-error";
import { StatusCodes } from "http-status-codes";
import Like from "./like.model";
import User from "../user/user.model";
import { sequelize } from "../../database";
import Person from "../person/person.model";
import UserImage from "../user/image/user.image.model";
import Image from "../image/image.model";
import { APIFeatures } from "../../lib/api.features";
import { GetLikesInput, LikeInput, UnlikeInput } from "./like.validator";

export const like = async_(
  async (
    req: Request<LikeInput, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const { event_id } = req.params;

    const event = await Event.findByPk(event_id);
    if (!event)
      throw new APIError("This event doesn't exist", StatusCodes.NOT_FOUND);

    const already_liked = await Like.findOne({ where: { event_id, user_id } });
    if (already_liked)
      throw new APIError("Already liked", StatusCodes.BAD_REQUEST);

    const like = await Like.create({ event_id, user_id });

    if (!like)
      throw new APIError("Error happened", StatusCodes.INTERNAL_SERVER_ERROR);

    event.likes_count++;
    await event.save();

    return res.status(StatusCodes.CREATED).json({ success: true });
  },
);
export const unlike = async_(
  async (
    req: Request<UnlikeInput, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const { event_id } = req.params;

    const event = await Event.findByPk(event_id);
    if (!event)
      throw new APIError("This event doesn't exist", StatusCodes.NOT_FOUND);

    const like = await Like.findOne({ where: { event_id, user_id } });
    if (!like) throw new APIError("Like doesn't exist", StatusCodes.NOT_FOUND);

    await like.destroy();
    event.likes_count--;
    await event.save();

    return res.status(StatusCodes.OK).json({ success: true });
  },
);
export const get_likes = async_(
  async (
    req: Request<GetLikesInput, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    const { event_id } = req.params;

    const event = await Event.findByPk(event_id);
    if (!event)
      throw new APIError("This event doesn't exist", StatusCodes.NOT_FOUND);

    const features = new APIFeatures(req.query).paginate();

    const likes = await Like.findAll({
      ...features.query,
      where: { event_id },
      include: [
        {
          model: User,
          attributes: [],
          include: [
            { model: Person, required: true },
            {
              model: UserImage,
              include: [
                {
                  model: Image,
                  required: true,
                  attributes: ["url", "secure_url", "createdAt"],
                  order: [["createdAt", "DESC"]],
                },
              ],
              attributes: [],
              required: false,
            },
          ],
        },
      ],
      attributes: [
        [
          sequelize.fn(
            "CONCAT",
            sequelize.col('"User->Person".first_name'),
            " ",
            sequelize.col('"User->Person".last_name'),
          ),
          "full_name",
        ],
        [sequelize.literal('"User->UserImages->Image".url'), "image_url"],
      ],
      subQuery: false,
    });

    return res.status(StatusCodes.OK).json({ success: true, data: likes });
  },
);
