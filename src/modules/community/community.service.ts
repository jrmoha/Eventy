import { Transaction } from "sequelize";
import Community from "./community.model";

export class CommunityService {
  constructor() {}
  public async saveCommunity(
    community: Community,
    t?: Transaction,
  ): Promise<Community> {
    await community.save({ transaction: t });
    return community;
  }
}
