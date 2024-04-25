import Event from "../event/event.model";

export class AttendanceService {
  constructor() {}
  public async increaseAttendeesCount(
    id: number,
    quantity: number,
  ): Promise<void> {
    await Event.increment("attendees_count", {
      by: quantity,
      where: {
        id,
      },
    });
  }
}
