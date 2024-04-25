import { NextFunction, Request, Response } from "express";
import { async_ } from "../../../interfaces/middleware/async.middleware";
import UserImage from "../../user/image/user.image.model";
import Image from "../../image/image.model";
import { sequelize } from "../../../database";
import Inbox from "../inbox.model";
import { APIError } from "../../../error/api-error";
import { StatusCodes } from "http-status-codes";
import { APIFeatures } from "../../../utils/api.features";
import Message from "./message.model";

export const get_messages = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { inbox_id } = req.params;
    const user_id = req.user?.id;

    const inbox = await Inbox.findByPk(inbox_id);
    if (!inbox) throw new APIError("Inbox not found", StatusCodes.NOT_FOUND);
    if (inbox.sender_id !== user_id && inbox.receiver_id !== user_id)
      throw new APIError("Unauthorized", StatusCodes.UNAUTHORIZED);

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

    const otherUserImage = await UserImage.findOne({
      where: {
        user_id:
          inbox.sender_id == user_id ? inbox.receiver_id : inbox.sender_id,
        is_profile: true,
      },
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
    const messages = await Message.findAll({
      where: { inbox_id },
      attributes: [
        "id",
        "message",
        "sender_id",
        "receiver_id",
        [
          sequelize.fn(
            "to_char",
            sequelize.col("createdAt"),
            "YYYY-MM-DD HH24:MI:SS",
          ),
          "createdAt",
        ],
      ],
      order: [["createdAt", "DESC"]],
      ...apifeatures.query,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        profile_image: userImage?.getDataValue("profile_image"),
        other_profile_image: otherUserImage?.getDataValue("profile_image"),
        messages,
      },
    });
  },
);
export const send_message = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { inbox_id } = req.params;
    const { message } = req.body;
    const user_id = req.user?.id;

    const inbox = await Inbox.findByPk(inbox_id);

    if (!inbox) throw new APIError("Inbox not found", StatusCodes.NOT_FOUND);
    if (inbox.sender_id !== user_id && inbox.receiver_id !== user_id)
      throw new APIError("Unauthorized", StatusCodes.UNAUTHORIZED);

    const senderImage = await UserImage.findOne({
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

    const receiverImage = await UserImage.findOne({
      where: {
        user_id:
          inbox.sender_id == user_id ? inbox.receiver_id : inbox.sender_id,
        is_profile: true,
      },
      include: [
        {
          model: Image,
          required: true,
          attributes: [],
        },
      ],

      attributes: [[sequelize.col("Image.url"), "profile_image"]],
    });

    const newMessage = await Message.create({
      message,
      sender_id: user_id,
      receiver_id:
        inbox.sender_id == user_id ? inbox.receiver_id : inbox.sender_id,
      inbox_id,
    });

    inbox.last_message = message;
    inbox.last_message_time = new Date();
    await inbox.save();

    const to_user = String(
      inbox.sender_id == user_id ? inbox.receiver_id : inbox.sender_id,
    );

    global.io.to(to_user).emit("new-message", {
      message,
      sender_id: user_id,
      receiver_id: to_user,
      inbox_id,
      createdAt: newMessage.createdAt,
      sender_image: senderImage?.getDataValue("profile_image"),
      receiver_image: receiverImage?.getDataValue("profile_image"),
    });

    return res
      .status(StatusCodes.CREATED)
      .json({ success: true, data: newMessage });
  },
);
