"use client";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

interface IMessageData {
  payment_id: string;
  order_id: string;
  amount: string;
  status: string;
  created_at: string;
  committed_at: string;
  bank_op_date: string;
}

const SocketComponent = () => {
  const [socket, setSocket] = useState<any>(null);
  const [message, setMessage] = useState<IMessageData | null>(null);
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
      "https://buffalo-salt-blowing-recovered.trycloudflare.com",
      {
        transports: ["websocket"], // Это ограничивает транспорт WebSocket.
        upgrade: false,
      }
    );

    setSocket(socketInstance);

    // Отправляем userId серверу
    socketInstance.emit("register", userId);

    // Слушаем сообщения от сервера
    socketInstance.on("message", (msg: IMessageData) => {
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
      {message ? (
        <div>
          <p>
            <strong>Payment ID:</strong> {message.payment_id}
          </p>
          <p>
            <strong>Order ID:</strong> {message.order_id}
          </p>
          <p>
            <strong>Amount:</strong> {message.amount}
          </p>
          <p>
            <strong>Status:</strong> {message.status}
          </p>
          <p>
            <strong>Created At:</strong> {message.created_at}
          </p>
          <p>
            <strong>Committed At:</strong> {message.committed_at}
          </p>
          <p>
            <strong>Bank Op Date:</strong> {message.bank_op_date}
          </p>
        </div>
      ) : (
        <p>No messages</p>
      )}
    </div>
  );
};

export default SocketComponent;
