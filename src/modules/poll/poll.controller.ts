import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { sequelize } from "../../database";
import Organizer from "../organizer/organizer.model";
import StatusCode from "http-status-codes";
import Post from "../post/post.model";
import Poll from "./poll.model";
import Poll_Options from "./poll.options.model";
import { APIError } from "../../types/APIError.error";
import Poll_Selection from "./poll.selection.model";
import { VoteInput } from "./poll.validator";
import Person from "../person/person.model";
import User from "../user/user.model";
import UserImage from "../image/user.image.model";
import Image from "../image/image.model";

export const create = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const t = await sequelize.transaction();
    req.transaction = t;
    const { content, options, multi_selection } = req.body;
    const user_id = req.user?.id;

    const organizer = await Organizer.findOrCreate({
      where: { id: user_id },
      defaults: {
        id: user_id,
      },
      transaction: t,
    });
    const post = await Post.create(
      { content, organizer_id: organizer[0].id },
      { transaction: t },
    );
    const poll = await Poll.create(
      { id: post.id, multi_selection },
      { transaction: t },
    );
    const poll_options_config = options.map((option: string) => {
      return { poll_id: poll.id, option };
    });

    const poll_options = await Poll_Options.bulkCreate(poll_options_config, {
      transaction: t,
    });
    await t.commit();
    return res.status(StatusCode.CREATED).json({
      success: true,
      data: {
        post,
        poll,
        poll_options,
      },
    });
  },
);

export const get_poll = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user_id = req.user?.id;

    const poll = await Poll.findByPk(id, {
      include: [
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
      ],
      attributes: [
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
        //get first name and last name of the user as full_name
        [
          sequelize.fn(
            "concat",
            sequelize.col("Post.Organizer.User.Person.first_name"),
            " ",
            sequelize.col("Post.Organizer.User.Person.last_name"),
          ),
          "full_name",
        ],
        //get username
        [sequelize.col("Post.Organizer.User.Person.username"), "username"],
        //get profile image
        [sequelize.col("Post.Organizer.User.UserImages.Image.url"), "profile_image"],

      ],
      benchmark: true,
      logging: console.log,
      replacements: { user_id },
      subQuery: false,
    });

    if (!poll) throw new APIError("Poll doesn't exist", StatusCode.NOT_FOUND);

    if (req.user?.id) {
      // for (const option of poll.dataValues.options) {
      //   await Poll_Selection.findOne({
      //     where: { user_id, option_id: option.id },
      //   }).then((vote) => {
      //     option.setDataValue("voted", !!vote);
      //   });
      // }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      poll.dataValues.options.forEach((option: any) => {
        option.setDataValue("voted", !!option.selections.length);
        // option.setDataValue("selections", undefined);
        delete option.dataValues.selections;
      });
    }

    return res.status(StatusCode.OK).json({
      success: true,
      data: poll,
    });
  },
);

export const vote = async_(
  async (
    req: Request<VoteInput, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const { poll_id, option_id } = req.params;

    const poll = await Poll.findByPk(poll_id);
    if (!poll) throw new APIError("Poll doesn't exist", StatusCode.NOT_FOUND);

    const option = await Poll_Options.findByPk(option_id);
    if (!option)
      throw new APIError("Poll option doesn't exist", StatusCode.NOT_FOUND);

    const already_vote = await Poll_Selection.findOne({
      where: { user_id, option_id },
    });

    if (already_vote)
      throw new APIError("Already voted", StatusCode.BAD_REQUEST);

    if (!poll.multi_selection) {
      const old_vote = await Poll_Selection.findOne({ where: { user_id } });
      if (old_vote) {
        await Poll_Options.decrement("votes", {
          where: { id: old_vote.option_id },
          by: 1,
        });
        await old_vote.destroy();
      }
    }
    const vote = await Poll_Selection.create({ user_id, option_id });
    await option.increment("votes", { by: 1 });

    return res.status(StatusCode.OK).json({
      success: true,
      data: vote,
    });
  },
);

export const unvote = async_(
  async (
    req: Request<VoteInput, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const { poll_id, option_id } = req.params;

    const poll = await Poll.findByPk(poll_id);
    if (!poll) throw new APIError("Poll doesn't exist", StatusCode.NOT_FOUND);

    const option = await Poll_Options.findByPk(option_id);
    if (!option)
      throw new APIError("Poll option doesn't exist", StatusCode.NOT_FOUND);

    const already_vote = await Poll_Selection.findOne({
      where: { user_id, option_id },
    });

    if (!already_vote)
      throw new APIError("vote doesn't exist", StatusCode.NOT_FOUND);

    await already_vote.destroy();
    option.votes--;
    await option.save();

    return res.status(StatusCode.OK).json({
      success: true,
    });
  },
);
