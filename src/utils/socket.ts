import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { socketMiddleware } from "../interfaces/middleware/socket.middleware";

export function configSocket(server: Server) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  io.use(socketMiddleware);

  io.on("connection", (socket) => {
    socket.on("send-hello", (data) => {
      console.log("Hello from client", data);
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
  return io;
}
