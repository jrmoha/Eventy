import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { sequelize } from "../../database";
import { async_ } from "../../interfaces/middleware/async.middleware";
import UserImage from "../image/user.image.model";
import Person from "../person/person.model";
import User from "../user/user.model";
import Inbox from "./inbox.model";
import Image from "../image/image.model";
import { APIFeatures } from "../../utils/api.features";

export const get_inboxes = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user?.id;
    const apifeatures = new APIFeatures(req.query).paginate();
    const inboxes = await Inbox.findAll({
      where: {
        [Op.or]: [{ sender_id: user_id }, { receiver_id: user_id }],
      },
      attributes: ["id", "sender_id", "receiver_id", "last_message"],
      ...apifeatures.query,
      order: [["last_message_time", "DESC"]],
    });

    const inboxPromise = inboxes.map(async (inbox) => {
      for (const inbox of inboxes) {
        const query = {
          id: inbox.sender_id !== user_id ? inbox.sender_id : inbox.receiver_id,
        };

        Person.findOne({
          where: query,
          include: [
            {
              model: User,
              attributes: [],
              required: true,
              include: [
                {
                  model: UserImage,
                  attributes: [],
                  required: true,
                  include: [
                    {
                      model: Image,
                      attributes: [],
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
          attributes: [
            "id",
            [
              sequelize.fn(
                "concat",
                sequelize.col("first_name"),
                " ",
                sequelize.col("last_name"),
              ),
              "full_name",
            ],
            [sequelize.col("User.UserImages.Image.secure_url"), "image_url"],
          ],
        }).then((user) => {
          inbox.setDataValue("user", user);
        });
      }
    });

    await Promise.all(inboxPromise);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: inboxes,
    });
  },
);
