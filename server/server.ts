import { SocketServer } from "./socket/SocketServer";

const PORT = Number(process.env.PORT) || 3000;
new SocketServer(PORT);
