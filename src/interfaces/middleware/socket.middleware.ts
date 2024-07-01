import StatusCodes from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "config";
import Person from "../../modules/person/person.model";
import { Socket } from "socket.io";

export const socketMiddleware = async (socket: Socket, next: Function) => {
  try {
    const token = socket.handshake.auth.headers["x-access-token"] as string;

    if (!token) {
      socket.emit("error", {
        message: "You must provide a token",
        status: StatusCodes.UNAUTHORIZED,
      });
    }

    if (!token.startsWith(config.get<string>("jwt.bearer"))) {
      socket.emit("error", {
        message: "Invalid token",
        status: StatusCodes.UNAUTHORIZED,
      });
    }

    const baseToken = token.split(" ")[1];

    const decoded = jwt.verify(
      baseToken,
      config.get<string>("jwt.private_key"),
    ) as JwtPayload;

    if (!decoded?.id)
      socket.emit("error", {
        message: "Invalid token",
        status: StatusCodes.UNAUTHORIZED,
      });

    const user = await Person.findByPk(decoded.id);

    if (!user)
      socket.emit("error", {
        message: "User not found",
        status: StatusCodes.NOT_FOUND,
      });

    if (!user?.confirmed)
      socket.emit("error", {
        message: "User not confirmed",
        status: StatusCodes.FORBIDDEN,
      });

    socket.data.user = decoded;

    next();
  } catch (e) {
    next(e);
  }
};
