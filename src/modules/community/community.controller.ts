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
import CommunityMessage from "./community.message.model";
import { sendMessageInCommunityInput } from "./community.validator";

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

export const send_message = async_(
  async (
    req: Request<
      sendMessageInCommunityInput["params"],
      {},
      sendMessageInCommunityInput["body"]
    >,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const community_id = req.params.id;
    const { message } = req.body;

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

    const t = await sequelize.transaction();

    await CommunityMessage.create(
      {
        community_id,
        sender_id: user_id,
        message,
      },
      { transaction: t },
    );

    community.last_message = message;
    community.last_message_time = new Date();
    await community.save({ transaction: t });
    await t.commit();

    CommunityMembership.findAll({
      where: {
        community_id,
      },
      attributes: ["user_id"],
    })
      .then((members) => members.map((member) => member.user_id))
      .then((members_ids) => {
        for (const member_id of members_ids) {
          console.log(`Sending message to ${member_id}`);

          if (member_id !== user_id) {
            global.io.to(member_id.toString()).emit("new-message", {
              community_id,
              message,
              sender_id: user_id,
            });
          }
        }
      });

    return res.status(StatusCodes.OK).json({
      success: true,
      // data: community_message,
    });
  },
);
