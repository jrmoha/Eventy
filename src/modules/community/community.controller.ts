import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import Community from "./community.model";
import { StatusCodes } from "http-status-codes";
import CommunityMembership from "./community.membership.model";
import config from "config";
import Image from "../image/image.model";
import { APIFeatures } from "../../utils/api.features";
import { APIError } from "../../types/APIError.error";
import Event from "../event/event.model";
import Post from "../post/post.model";
import { sequelize } from "../../database";

export const get_communities = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user?.id;

    const apifeatures = new APIFeatures(req.query).paginate();

    const default_group_image = await Image.findOne({
      where: {
        public_id: config.get<string>("images.default_group_image"),
      },
      attributes: ["secure_url"],
    });

    const communities = await Community.findAll({
      include: [
        {
          model: CommunityMembership,
          where: {
            user_id,
          },
          required: true,
          attributes: [],
        },
      ],
      attributes: ["id", "name", "last_message", "last_message_time"],
      order: [["last_message_time", "DESC"]],
      ...apifeatures.query,
    }).then((communities) => {
      return communities.map((community) => {
        return {
          id: community.id,
          name: community.name,
          last_message: community.last_message,
          last_message_time: new Date(
            community.last_message_time,
          ).toLocaleString(),
          image_url: default_group_image?.secure_url,
        };
      });
    });

    return res
      .status(StatusCodes.OK)
      .json({ success: true, data: communities });
  },
);
export const join = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user?.id;
    const community_id = req.params.id;

    const community = await Community.findByPk(community_id);

    if (!community)
      throw new APIError("Community not found", StatusCodes.NOT_FOUND);

    const membership = await CommunityMembership.findOne({
      where: {
        user_id,
        community_id,
      },
    });

    if (membership)
      throw new APIError("Already a member", StatusCodes.BAD_REQUEST);

    CommunityMembership.create({
      user_id,
      community_id,
    }).then((_) => {
      return res.status(StatusCodes.OK).json({
        success: true,
      });
    });
  },
);

export const leave = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user?.id;
    const community_id = req.params.id;

    const community = await Community.findByPk(community_id);

    if (!community)
      throw new APIError("Community not found", StatusCodes.NOT_FOUND);

    const membership = await CommunityMembership.findOne({
      where: {
        user_id,
        community_id,
      },
    });

    if (!membership)
      throw new APIError("Not a member", StatusCodes.BAD_REQUEST);

    const event = await Event.findByPk(community_id, {
      include: [
        {
          model: Post,
          required: true,
          attributes: [],
        },
      ],
      attributes: [[sequelize.col("Post.organizer_id"), "organizer_id"]],
    });

    if (event?.organizer_id === user_id)
      throw new APIError(
        "Organizer cannot leave community, please delete the community instead.",
        StatusCodes.BAD_REQUEST,
      );

    membership.destroy().then(() => {
      return res.status(StatusCodes.OK).json({
        success: true,
      });
    });
  },
);
