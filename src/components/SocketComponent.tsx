"use client";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketComponent = () => {
  const [socket, setSocket] = useState<any>(null);
  const [message, setMessage] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Проверяем, есть ли window (т.е. код выполняется в браузере)
    if (typeof window !== "undefined") {
      const storedUserId =
        localStorage.getItem("userId") || crypto.randomUUID();
      localStorage.setItem("userId", storedUserId);
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (!userId) return; // Ждём, пока userId установится

    // Подключаемся к серверу
    const socketInstance = io(
      "https://generator-hayes-himself-korea.trycloudflare.com",
      {
        transports: ["websocket"], // Это ограничивает транспорт WebSocket.
        upgrade: false,
      }
    );

    setSocket(socketInstance);

    // Отправляем userId серверу
    socketInstance.emit("register", userId);

    // Слушаем сообщения от сервера
    socketInstance.on("message", (msg: string) => {
      console.log("Message from server:", msg);
      setMessage(msg);
    });

    // Очистка при размонтировании
    return () => {
      socketInstance.disconnect();
    };
  }, [userId]); // Ждём, пока userId установится

  const sendMessage = () => {
    if (socket && userId) {
      socket.emit("message", { userId, text: "Hello from client!" });
    }
  };

  return (
    <div>
      <h1>Socket.io with Next.js</h1>
      {userId ? <p>User ID: {userId}</p> : <p>Loading user ID...</p>}
      <button onClick={sendMessage} disabled={!userId}>
        Send Message
      </button>
      <p>Server Response: {message}</p>
    </div>
  );
};

export default SocketComponent;
