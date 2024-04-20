import { FindAttributeOptions } from "sequelize";
import { sequelize } from "../../database";
import Poll from "./poll.model";
import UserImage from "../image/user.image.model";
import Organizer from "../organizer/organizer.model";
import Person from "../person/person.model";
import Post from "../post/post.model";
import User from "../user/user.model";
import Poll_Options from "./poll.options.model";
import Poll_Selection from "./poll.selection.model";
import Image from "../image/image.model";

export class PollService {
  constructor() {}
  public async getPoll(
    id: number,
    user_id: number | undefined,
  ): Promise<Poll | null> {
    const attributes: FindAttributeOptions = [
      "id",
      "multi_selection",
      [sequelize.col("Post.content"), "content"],
      [
        sequelize.fn(
          "to_char",
          sequelize.col("Post.createdAt"),
          "YYYY-MM-DD HH24:MI:SS",
        ),
        "createdAt",
      ],
      [
        sequelize.fn(
          "concat",
          sequelize.col("Post.Organizer.User.Person.first_name"),
          " ",
          sequelize.col("Post.Organizer.User.Person.last_name"),
        ),
        "full_name",
      ],
      [sequelize.col("Post.Organizer.User.Person.username"), "username"],
      [
        sequelize.col("Post.Organizer.User.UserImages.Image.url"),
        "profile_image",
      ],
    ];
    const include = [
      {
        model: Post,
        required: true,
        where: { status: "published" },
        attributes: [],
        include: [
          {
            model: Organizer,
            required: true,
            attributes: [],
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
          },
        ],
      },
      {
        model: Poll_Options,
        as: "options",
        attributes: ["id", "option", "votes"],
        include: [
          {
            model: Poll_Selection,
            as: "selections",
            where: { user_id },
            required: false,
            attributes: ["user_id"],
          },
        ],
      },
    ];
    return Poll.findByPk(id, {
      include,
      attributes,
      benchmark: true,
      replacements: { user_id },
      subQuery: false,
    });
  }
}
