import { Op } from "sequelize";
import { sequelize } from "../../database";
import Image from "../image/image.model";
import UserImage from "../user/image/user.image.model";
import Person from "../person/person.model";
import User from "../user/user.model";
import FriendRequest from "./friendrequest.model";
import { APIFeatures } from "../../lib/api.features";

export class FriendRequestService {
  constructor() {}
  public async getAllFriendRequests(user_id: number, apifeatures: APIFeatures) {
    return FriendRequest.findAll({
      where: {
        receiver_id: user_id,
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: [],
          required: true,
          where: {
            id: {
              [Op.ne]: user_id,
            },
          },
          include: [
            {
              model: Person,
              attributes: [],
              required: true,
            },
            {
              model: UserImage,
              attributes: [],
              required: true,
              where: { is_profile: true },
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
        [sequelize.col("sender.id"), "sender_id"],
        [sequelize.col("sender.followers_count"), "followers_count"],
        [sequelize.col("sender.Person.username"), "username"],
        [
          sequelize.fn(
            "concat",
            sequelize.col("sender.Person.first_name"),
            " ",
            sequelize.col("sender.Person.last_name"),
          ),
          "full_name",
        ],
        [sequelize.col("sender.UserImages.Image.secure_url"), "image_url"],
        [
          sequelize.literal(
            "CASE WHEN EXISTS (SELECT 1 FROM organizer WHERE user_id = sender.id) THEN 'o' ELSE 'u' END",
          ),
          "role",
        ],
      ],
      order: [["createdAt", "DESC"]],
      ...apifeatures.query,
      subQuery: false,
    });
  }
}
