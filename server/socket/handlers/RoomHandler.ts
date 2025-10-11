import { Server, Socket } from "socket.io";
import { prisma } from "../../client";

export class RoomHandler {
  constructor(private io: Server, private socket: Socket) {
    this.registerEvents();
  }

  private registerEvents() {
    this.socket.on("joinRoom", (roomName: string) => this.handleJoinRoom(roomName));
  }

  private async handleJoinRoom(roomName: string) {
    await this.socket.join(roomName);

    await prisma.user.upsert({
      where: { socketId: this.socket.id },
      update: { room: roomName },
      create: { socketId: this.socket.id, room: roomName },
    });

    this.io.to(roomName).emit("message", {
      text: `Пользователь ${this.socket.id} присоединился к комнате "${roomName}"`,
      room: roomName,
    });

    console.log(`[ROOM] ${this.socket.id} joined room "${roomName}"`);
  }

  public broadcastUpdate(data: any) {
    const rooms = Array.from(this.io.sockets.adapter.rooms.keys());

    for (const room of rooms) {
      const isUserRoom = this.io.sockets.adapter.rooms.get(room)?.has(room) === false;
      if (room === "admin" || !isUserRoom) continue;

      this.io.to(room).emit("update", data);
      console.log(`[UPDATE] Sent to room: ${room}`);
    }
  }
}
