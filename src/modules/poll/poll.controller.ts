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

export const get = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user_id = req.user?.id;
    const post = await Post.findOne({
      where: {
        id,
        status: "published",
      },
      include: [
        {
          model: Poll,
          include: [
            {
              model: Post,
              required: true,
              attributes: [],
            },
            {
              model: Poll_Options,
              as: "options",
              attributes: [
                "id",
                "option",
                "votes",
                [
                  sequelize.literal(
                    `CASE WHEN ${user_id ? user_id : null} IN (SELECT user_id FROM poll_selection WHERE option_id = "Poll->options".id) THEN 'true' ELSE 'false' END`,
                  ),
                  "voted",
                ],
              ],
            },
          ],
          attributes: ["id"],
        },
      ],
      attributes: [
        "id",
        "content",
        "createdAt",
        [sequelize.col("Poll.multi_selection"), "multi_selection"],
        [sequelize.col("Poll.Post.content"), "content"],
      ],
    });

    if (!post) throw new APIError("Poll not found", StatusCode.NOT_FOUND);

    const result = {
      id: post.id,
      content: post.content,
      createdAt: post.createdAt.toLocaleString(),
      multi_selection: post.dataValues?.multi_selection,
      options: post.dataValues.Poll.options.map(
        (option: {
          id: number;
          option: string;
          votes: number;
          voted: boolean;
        }) => {
          return {
            id: option.id,
            option: option.option,
            votes: option.votes,
            voted: option.voted,
          };
        },
      ),
    };

    return res.status(StatusCode.OK).json({
      success: true,
      data: result,
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
