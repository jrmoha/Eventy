import { Server as SocketIOServer } from "socket.io";

export const thisIsAModule = true;
declare global {
  // eslint-disable-next-line no-var
  var io: SocketIOServer;
}

