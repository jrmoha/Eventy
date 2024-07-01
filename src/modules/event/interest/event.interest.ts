import Event from "../event.model";
import Event_Interest from "./event.interest.model";

export class EventInterestService {
  constructor() {}
  public async getInterested(event: Event) {
    return Event_Interest.findAll({
      where: {
        event_id: event.id,
      },
    });
  }
}
