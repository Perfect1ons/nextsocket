import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

// Создаем Express приложение
const app = express();
const server = createServer(app);

// Настройка CORS для всех источников
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

// Разрешаем парсить JSON в теле запроса
app.use(express.json());

// Хранение соответствий userId → socketId
const userSocketMap: { [userId: string]: string } = {};

// Когда клиент подключается
io.on("connection", (socket) => {
  console.log("A user connected, socket id:", socket.id);

  // Слушаем событие, где клиент отправляет свой userId
  socket.on("register", (userId: string) => {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket id ${socket.id}`);
  });

  // Слушаем событие от клиента
  socket.on("message", (msg) => {
    console.log("Message from client:", msg);
    socket.emit("response", "Hello from server!");
  });

  // Когда пользователь отключается
  socket.on("disconnect", () => {
    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// 📌 Эндпоинт для отправки сообщений через WebSocket
app.post("/send-message", (req: any, res: any) => {
  const { userId, message } = req.body;

  if (!message) {
    return res
      .status(400)
      .json({ success: false, message: "Message is required" });
  }

  if (userId) {
    // 📌 Если указан `userId`, отправляем только ему
    const socketId = userSocketMap[userId];

    if (socketId) {
      io.to(socketId).emit("message", message);
      return res
        .status(200)
        .json({ success: true, message: `Message sent to user ${userId}` });
    } else {
      return res
        .status(404)
        .json({ success: false, message: `User ${userId} not found` });
    }
  } else {
    // 📌 Если `userId` НЕ указан, отправляем всем
    io.emit("message", message);
    return res
      .status(200)
      .json({ success: true, message: "Message sent to all users" });
  }
});

// Сервер слушает порт 3001
server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
