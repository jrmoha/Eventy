import config from "config";
import { Encryption } from "../../lib/encryption";
import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { OrderDetailsInput } from "../order/order.validator";
import Order, { OrderStatus } from "../order/order.model";
import { APIError } from "../../error/api-error";
import { StatusCodes } from "http-status-codes";
import Ticket from "../event/tickets/event.tickets.model";
import Event from "../event/event.model";
import Attendance from "./attendance.model";
import { z } from "zod";
import { AttendanceService } from "./attendance.service";

export const make_attendance = async_(
  async (
    req: Request<OrderDetailsInput, {}, {}>,
    res: Response,
    next: NextFunction,
  ) => {
    const { enc } = req.params;

    const ticketEncrytionKey = config.get<string>(
      "ticket.encryption_key",
    ) as string;
    const EncryptionServiceInstance = new Encryption(ticketEncrytionKey);
    const order_id = EncryptionServiceInstance.decodeURI(enc);

    const is_valid = z.string().uuid().safeParse(order_id);
    if (!is_valid.success)
      throw new APIError("Invalid Order ID", StatusCodes.BAD_REQUEST);

    const order = await Order.findByPk(order_id);

    if (!order)
      throw new APIError("Ticket doesn't exist", StatusCodes.NOT_FOUND);
    if (order.status != OrderStatus.success)
      throw new APIError("Order is not success", StatusCodes.BAD_REQUEST);

    const ticket = await Ticket.findByPk(order.ticket_id);
    if (!ticket)
      throw new APIError("Ticket doesn't exist", StatusCodes.NOT_FOUND);

    const event = await Event.findByPk(ticket.event_id);
    if (!event)
      throw new APIError("Event doesn't exist", StatusCodes.NOT_FOUND);

    //check if event date is today
    const today = new Date();
    const eventDate = new Date(event.date);
    const is_today =
      today.getDate() == eventDate.getDate() &&
      today.getMonth() == eventDate.getMonth() &&
      today.getFullYear() == eventDate.getFullYear();

    if (!is_today)
      throw new APIError("Event date is not today", StatusCodes.BAD_REQUEST);

    const attended = await Attendance.findOne({
      where: {
        user_id: order.user_id,
        event_id: event.id,
      },
    });

    if (attended)
      throw new APIError("Ticket Already Used", StatusCodes.FORBIDDEN);

    await Attendance.create({
      user_id: order.user_id,
      event_id: event.id,
    });

    //Increase the attendees count
    const AttendanceServiceInstance = new AttendanceService();
    await AttendanceServiceInstance.increaseAttendeesCount(
      event.id,
      order.quantity,
    );

    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: "Ticket is valid" });
  },
);
