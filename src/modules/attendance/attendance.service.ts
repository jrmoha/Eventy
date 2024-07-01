import Event from "../event/event.model";
import Attendance from "./attendance.model";

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
  public async isAttendee(user_id: number, event_id: number): Promise<boolean> {
    return !!(await Attendance.findOne({
      where: {
        user_id,
        event_id,
      },
    }));
  }
}
