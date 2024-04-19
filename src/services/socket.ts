import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { socketMiddleware } from "../interfaces/middleware/socket.middleware";

export class SocketService {
  private io: SocketIOServer;

  constructor(server?: Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["POST", "GET"],
        credentials: true,
        allowedHeaders: ["x-access-token"],
      },
    });
  }
  public async init() {
    this.io.use(socketMiddleware);

    this.io.on("connection", (socket) => {
      socket.join(socket.data.user.id);

      socket.on("disconnect", () => {
        socket.leave(socket.data.user.id);
      });
    });
    return this.io;
  }
  public getIO() {
    return this.io;
  }
}
