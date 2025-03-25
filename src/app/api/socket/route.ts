// app/api/socket/route.ts
import { NextResponse } from "next/server";
import { Server } from "socket.io";


export async function GET() {
  // Возвращаем базовый ответ для запросов
  return NextResponse.json({ message: "Socket.io server running" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function socketServerHandler(req: any, res: any) {
  const io = new Server(res.socket.server);

  // Когда клиент подключается
  io.on("connection", (socket) => {
    console.log("A user connected");

    // Слушаем событие от клиента
    socket.on("message", (msg) => {
      console.log("Message from client:", msg);
      socket.emit("response", "Hello from server!");
    });

    // Когда пользователь отключается
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });

  res.socket.server.io = io; // Присваиваем серверу
  return res;
}
