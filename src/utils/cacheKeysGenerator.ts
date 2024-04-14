import { Request } from "express";

export class CacheKeysGenerator {
  constructor() {}
  private EventKeyGenerator(req: Request): string {
    if (req.user) return `Event:${req.params.id};User:${req.user.id}`;
    return `Event:${req.params.id}`;
  }
  private UserKeyGenerator(req: Request): string {
    if (req.user) return `User:${req.params.id};User:${req.user.id}`;
    return `User:${req.params.id}`;
  }

  private PollKeyGenerator(req: Request): string {
    return `Poll:${req.params.id};User:${req.user?.id}`;
  }
  private OrganizerKeyGenerator(req: Request): string {
    if (req.user) return `Organizer:${req.params.id};User:${req.user.id}`;
    return `Organizer:${req.params.id}`;
  }
  public keysGenerator = {
    event: this.EventKeyGenerator,
    user: this.UserKeyGenerator,
    poll: this.PollKeyGenerator,
    organizer: this.OrganizerKeyGenerator,
  };
}
