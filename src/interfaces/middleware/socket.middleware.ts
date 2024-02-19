import StatusCodes from "http-status-codes";
import { APIError } from "../../types/APIError.error";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "config";
import Person from "../../modules/person/person.model";
import { Socket } from "socket.io";

export const socketMiddleware = async (socket: Socket, next: Function) => {
  try {
    const token = socket.handshake.headers["x-access-token"] as string;
    console.log(`Socket token: ${token}`);
    
    if (!token)
      throw new APIError("No Token Provided", StatusCodes.BAD_REQUEST);

    if (!token.startsWith(config.get<string>("jwt.bearer")))
      throw new APIError("Wrong Signature", StatusCodes.BAD_REQUEST);

    const baseToken = token.split(" ")[1];

    const decoded = jwt.verify(
      baseToken,
      config.get<string>("jwt.secret"),
    ) as JwtPayload;

    if (!decoded?.id)
      throw new APIError("Invalid token", StatusCodes.UNAUTHORIZED);

    const user = await Person.findByPk(decoded.id);

    if (!user)
      throw new APIError("This user doesn't exist", StatusCodes.NOT_FOUND);

    if (!user.confirmed)
      throw new APIError(
        "Please confirm your email first",
        StatusCodes.NON_AUTHORITATIVE_INFORMATION,
      );

    // socket.user = decoded;
    next();
  } catch (e) {
    next(e);
  }
};
