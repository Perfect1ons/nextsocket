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
  const {
    payment_id,
    order_id,
    amount,
    status,
    created_at,
    committed_at,
    bank_op_date,
  } = req.body;

  // Проверяем, переданы ли все нужные поля
  if (
    !payment_id ||
    !order_id ||
    !amount ||
    !status ||
    !created_at ||
    !committed_at ||
    !bank_op_date
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  // Отправляем данные через WebSocket всем подключенным клиентам
  io.emit("message", {
    payment_id,
    order_id,
    amount,
    status,
    created_at,
    committed_at,
    bank_op_date,
  });

  return res
    .status(200)
    .json({ success: true, message: "Message broadcasted", data: req.body });
});

// Сервер слушает порт 3001
server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
