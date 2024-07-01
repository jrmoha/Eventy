import { Op } from "sequelize";
import Block from "./block.model";

export class BlockService {
  constructor() {}
  public async unblock(block: Block): Promise<void> {
    return block.destroy();
  }
  public async any_block_exists(
    user_id: number | undefined,
    blocked_user_id: number,
  ): Promise<Block | null> {
    return Block.findOne({
      where: {
        [Op.or]: [
          { blocker_id: user_id, blocked_id: blocked_user_id },
          { blocker_id: blocked_user_id, blocked_id: user_id },
        ],
      },
    });
  }
  public async block_exists(
    user_id: number | undefined,
    blocked_user_id: number,
  ): Promise<Block | null> {
    return Block.findOne({
      where: {
        blocker_id: user_id,
        blocked_id: blocked_user_id,
      },
    });
  }
  public async block(
    user_id: number | undefined,
    blocked_user_id: number,
  ): Promise<Block> {
    return Block.create({
      blocker_id: user_id,
      blocked_id: blocked_user_id,
    });
  }
}
