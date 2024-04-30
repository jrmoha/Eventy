import { AttendanceService } from "./../attendance/attendance.service";
import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { APIError } from "../../error/api-error";
import Event from "../event/event.model";
import Organizer from "../organizer/organizer.model";
import StatusCodes from "http-status-codes";
import Post from "../post/post.model";
import { sequelize } from "../../database";
import { CreateRateInput } from "./rate.validator";
import { RateService } from "./rate.service";

export const rate = async_(
  async (
    req: Request<CreateRateInput["params"], {}, CreateRateInput["body"]>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    if (!user_id) return;

    const { rate: rate_string, review } = req.body;
    const { event_id } = req.params;

    const rate = parseInt(rate_string, 10);

    // Check if rate exists for the user
    const RateServiceInstance = new RateService();
    const rate_exists = await RateServiceInstance.rateExists(user_id, event_id);
    if (rate_exists)
      throw new APIError("Rate already exists", StatusCodes.BAD_REQUEST);

    // Check if event exists
    const event = await Event.findByPk(event_id, {
      include: [
        {
          model: Post,
          required: true,
          attributes: [],
        },
      ],
      attributes: ["id", [sequelize.col("Post.organizer_id"), "organizer_id"]],
    });
    if (!event) throw new APIError("Event not found", StatusCodes.NOT_FOUND);

    const organizer = await Organizer.findByPk(event.organizer_id);
    if (!organizer)
      throw new APIError("Organizer not found", StatusCodes.NOT_FOUND);

    // Check if user is an attendee of the event
    const AttendanceServiceInstance = new AttendanceService();
    const is_attendee = await AttendanceServiceInstance.isAttendee(
      user_id,
      event_id,
    );

    if (!is_attendee)
      throw new APIError("User is not an attendee", StatusCodes.FORBIDDEN);

    // initiate transaction
    const t = await sequelize.transaction();

    // Create new rate
    const new_rate = await RateServiceInstance.createRate(
      user_id,
      event_id,
      rate,
      review,
      t,
    );

    // calculate new rate of the organizer and update it
    await RateServiceInstance.calculateOrganizerRate(organizer, rate, t);

    // commit transaction
    await t.commit();
    return res
      .status(StatusCodes.CREATED)
      .json({ success: true, data: new_rate });
  },
);
