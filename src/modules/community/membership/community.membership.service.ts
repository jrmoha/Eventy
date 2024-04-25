import { Transaction } from "sequelize";
import CommunityMembership from "./community.membership.model";

export class CommunityMembershipService {
  constructor() {}
  public async addMember(
    membership: CommunityMembership,
    t?: Transaction,
  ): Promise<CommunityMembership> {
    await membership.save({ transaction: t });
    return membership;
  }
}
