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
import {
  CommunityMessageInput,
  AdminInput,
  DeleteCommunityInput,
} from "./community.validator";
import UserImage from "../image/user.image.model";
import User from "../user/user.model";
import Person from "../person/person.model";

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
export const make_admin = async_(
  async (
    req: Request<AdminInput["params"], {}, AdminInput["body"]>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const community_id = req.params.id;
    const { member_id } = req.body;

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

    if (membership.role !== "admin")
      throw new APIError("Not an admin", StatusCodes.BAD_REQUEST);

    const member = await CommunityMembership.findOne({
      where: {
        user_id: member_id,
        community_id,
      },
    });

    if (!member) throw new APIError("Member not found", StatusCodes.NOT_FOUND);

    member.role = "admin";
    member.save().then(() => {
      return res.status(StatusCodes.OK).json({
        success: true,
      });
    });
  },
);
export const remove_admin = async_(
  async (
    req: Request<AdminInput["params"], {}, AdminInput["body"]>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const community_id = req.params.id;
    const { member_id } = req.body;

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

    if (membership.role !== "admin")
      throw new APIError("Not an admin", StatusCodes.BAD_REQUEST);

    const member = await CommunityMembership.findOne({
      where: {
        user_id: member_id,
        community_id,
      },
    });

    if (!member) throw new APIError("Member not found", StatusCodes.NOT_FOUND);

    member.role = "member";
    member.save().then(() => {
      return res.status(StatusCodes.OK).json({
        success: true,
      });
    });
  },
);
export const delete_community = async_(
  async (
    req: Request<DeleteCommunityInput, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
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

    if (membership.role !== "admin")
      throw new APIError("Not an admin", StatusCodes.BAD_REQUEST);

    const promises = [
      CommunityMembership.destroy({
        where: {
          community_id,
        },
      }),
      CommunityMessage.destroy({
        where: {
          community_id,
        },
      }),
      Community.destroy({
        where: {
          id: community_id,
        },
      }),
    ];

    await Promise.all(promises).then(() => {
      return res.status(StatusCodes.OK).json({
        success: true,
      });
    });
  },
);
export const delete_member = async_(
  async (
    req: Request<AdminInput["params"], {}, AdminInput["body"]>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const community_id = req.params.id;
    const { member_id } = req.body;

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

    if (membership.role !== "admin")
      throw new APIError("Not an admin", StatusCodes.BAD_REQUEST);

    const member = await CommunityMembership.findOne({
      where: {
        user_id: member_id,
        community_id,
      },
    });

    if (!member) throw new APIError("Member not found", StatusCodes.NOT_FOUND);

    member.destroy().then(() => {
      return res.status(StatusCodes.OK).json({
        success: true,
      });
    });
  },
);
export const send_message = async_(
  async (
    req: Request<
      CommunityMessageInput["params"],
      {},
      CommunityMessageInput["body"]
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
export const get_messages = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { community_id } = req.params;
    const user_id = req.user?.id;

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

    const userImage = await UserImage.findOne({
      where: { user_id, is_profile: true },
      include: [
        {
          model: Image,
          required: true,
          attributes: [],
        },
      ],
      attributes: [[sequelize.col("Image.url"), "profile_image"]],
    });

    const apifeatures = new APIFeatures(req.query).paginate();

    const messages = await CommunityMessage.findAll({
      where: { community_id },
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
            {
              model: UserImage,
              required: true,
              attributes: [],
              where: { is_profile: true },
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
        "message",
        "sender_id",
        //  [
        //   sequelize.fn(
        //     "to_char",
        //     sequelize.col("createdAt"),
        //     "YYYY-MM-DD HH24:MI:SS",
        //   ),
        "createdAt",
        // ],
        //concat first name and last name as full name
        // [
        //   sequelize.fn(
        //     "concat",
        //     sequelize.col("User.Person.first_name"),
        //     " ",
        //     sequelize.col("User.Person.last_name"),
        //   ),
        //   "full_name",
        // ],
        [sequelize.col("User.Person.username"), "username"],
        [sequelize.col("User.UserImages.Image.secure_url"), "profile_image"],
      ],
      order: [["createdAt", "DESC"]],
      ...apifeatures.query,
      subQuery: false,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        profile_image: userImage?.getDataValue("profile_image"),
        messages,
      },
    });
  },
);

export const community_members = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user_id = req.user?.id;

    const apifeatures = new APIFeatures(req.query).paginate();

    const community = await Community.findByPk(id);
    if (!community)
      throw new APIError("Community not found", StatusCodes.NOT_FOUND);

    const membership = await CommunityMembership.findOne({
      where: {
        user_id,
        community_id: id,
      },
    });

    if (!membership)
      throw new APIError("Not a member", StatusCodes.UNAUTHORIZED);

    const members = await CommunityMembership.findAll({
      where: {
        community_id: id,
      },
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
            {
              model: UserImage,
              required: true,
              attributes: [],
              where: { is_profile: true },
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
        "user_id",
        "role",
        [
          sequelize.fn(
            "concat",
            sequelize.col("User.Person.first_name"),
            " ",
            sequelize.col("User.Person.last_name"),
          ),
          "full_name",
        ],
        [sequelize.col("User.Person.username"), "username"],
        [sequelize.col("User.UserImages.Image.secure_url"), "profile_image"],
      ],
      order: [
        //order by user first one then admins then members
        [sequelize.literal("role = 'admin'"), "DESC"],
        [sequelize.literal("role = 'member'"), "DESC"],
      ],
      subQuery: false,
      benchmark: true,
      logging: console.log,
      ...apifeatures.query,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      data: members,
    });
  },
);
