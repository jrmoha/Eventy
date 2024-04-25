import { PollService } from "./poll.service";
import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { sequelize } from "../../database";
import Organizer from "../organizer/organizer.model";
import StatusCode from "http-status-codes";
import Post from "../post/post.model";
import Poll from "./poll.model";
import Poll_Options from "./poll.options.model";
import { APIError } from "../../error/api-error";
import Poll_Selection from "./poll.selection.model";
import { VoteInput } from "./poll.validator";
import { RedisService } from "../../cache";
import { CacheKeysGenerator } from "../../utils/cache_keys_generator";

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

    const PollServiceInstance = new PollService();
    const poll = await PollServiceInstance.getPoll(+id, user_id);

    if (!poll) throw new APIError("Poll doesn't exist", StatusCode.NOT_FOUND);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    poll.dataValues.options.forEach((option: any) => {
      option.setDataValue("voted", !!option.selections.length);
      delete option.dataValues.selections;
    });

    //********** Cache Poll **********//
    const redisClient = new RedisService();
    const key = new CacheKeysGenerator().keysGenerator["poll"](req);
    await redisClient.set(key, poll);

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
    const { option_id } = req.params;

    const option = await Poll_Options.findByPk(option_id);
    if (!option)
      throw new APIError("Poll option doesn't exist", StatusCode.NOT_FOUND);

    const poll = await Poll.findByPk(option.poll_id);
    if (!poll) throw new APIError("Poll doesn't exist", StatusCode.NOT_FOUND);

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

    const redisClient = new RedisService();
    const key = new CacheKeysGenerator().keysGenerator["poll"](req);
    await redisClient.del(key);

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
    const { option_id } = req.params;

    const option = await Poll_Options.findByPk(option_id);
    if (!option)
      throw new APIError("Poll option doesn't exist", StatusCode.NOT_FOUND);

    // const poll = await Poll.findByPk(poll_id);
    // if (!poll) throw new APIError("Poll doesn't exist", StatusCode.NOT_FOUND);
    const already_vote = await Poll_Selection.findOne({
      where: { user_id, option_id },
    });

    if (!already_vote)
      throw new APIError("vote doesn't exist", StatusCode.NOT_FOUND);

    await already_vote.destroy();
    option.votes--;
    await option.save();

    const redisClient = new RedisService();
    const key = new CacheKeysGenerator().keysGenerator["poll"](req);
    await redisClient.del(key);

    return res.status(StatusCode.OK).json({
      success: true,
    });
  },
);
