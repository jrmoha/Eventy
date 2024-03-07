import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { socketMiddleware } from "../interfaces/middleware/socket.middleware";
import Inbox from "../modules/inbox/inbox.model";
import { Op } from "sequelize";
import Message from "../modules/message/message.model";
import Friendship from "../modules/friendship/friendship.model";
import { APIError } from "../types/APIError.error";
import { StatusCodes } from "http-status-codes";

export class SocketService {
  private io: SocketIOServer;

  constructor(server: Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["x-access-token"],
      },
    });

    this.io.use(socketMiddleware);

    this.io.on("connection", (socket) => {
      socket.on("join", () => {
        socket.join(socket.data.user.id);
      });

      socket.on("send-message", async ({ message, receiver_id }) => {
        try {
          const sender_id = socket.data.user.id;

          if (sender_id == receiver_id) {
            throw new APIError(
              "You can't send a message to yourself",
              StatusCodes.BAD_REQUEST,
            );
          }

          const is_friends = await Friendship.findOne({
            where: {
              [Op.or]: [
                { sender_id, receiver_id },
                { sender_id: receiver_id, receiver_id: sender_id },
              ],
            },
          });

          if (!is_friends) {
            throw new APIError(
              "You can't send a message to someone you're not friends with",
              StatusCodes.FORBIDDEN,
            );
          }

          const [inbox, _] = await Inbox.findOrCreate({
            where: {
              [Op.or]: [
                { sender_id, receiver_id },
                { sender_id: receiver_id, receiver_id: sender_id },
              ],
            },
            defaults: {
              sender_id,
              receiver_id,
              last_message: message,
              last_message_time: new Date(),
            },
          });

          await Message.create({
            message,
            sender_id,
            receiver_id,
            inbox_id: inbox.id,
          });

          socket.to(receiver_id).emit("new-message", {
            message,
            sender_id,
            receiver_id,
            inbox_id: inbox.id,
          });
        } catch (e) {
          if (e instanceof Error) {
            return socket.emit("error", e.message);
          }
          return socket.emit("error", "An error occurred");
        }
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  }
  public getIO() {
    return this.io;
  }
}
