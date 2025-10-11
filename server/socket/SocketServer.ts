import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { RoomHandler } from "./handlers/RoomHandler";

export class SocketServer {
  private io: Server;

  constructor(private port: number) {
    const app = express();
    const server = createServer(app);
    this.io = new Server(server, { cors: { origin: "*" } });

    this.io.on("connection", (socket) => {
      console.log(`[CONNECT] ${socket.id}`);
      const handler = new RoomHandler(this.io, socket);

      socket.on("sendUpdate", (data) => handler.broadcastUpdate(data));

      socket.on("disconnect", () => {
        console.log(`[DISCONNECT] ${socket.id}`);
      });
    });

    server.listen(this.port, () => console.log(`Server running on port ${this.port}`));
  }
}
