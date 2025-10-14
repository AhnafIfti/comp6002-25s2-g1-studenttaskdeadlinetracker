// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type Notification = {
  id: string;
  taskId: string;
  title: string;
  dueAt: string;
  dueTime?: string;
  courseId?: string | null;
  message?: string;
  read?: boolean;
  receivedAt: string;
};

type SocketContextValue = {
  socket?: Socket;
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  clearAll: () => void;
};

const SocketContext = createContext<SocketContextValue>({
  socket: undefined,
  notifications: [],
  unreadCount: 0,
  markRead: () => {},
  clearAll: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const s = io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000");
    setSocket(s);

    s.on("connect", () => {
      console.log("✅ Socket connected:", s.id);
      const token = localStorage.getItem("token");
      const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;
      if (decoded?.id) {
        s.emit("register", decoded.id);
        console.log("📡 Registered user:", decoded.id);
      }
    });

    s.on("deadlineAlert", (data) => {
      const notif: Notification = {
        id: `${data.taskId}_${Date.now()}`,
        taskId: data.taskId,
        title: data.title,
        dueAt: data.dueAt,
        dueTime: data.dueTime,
        courseId: data.courseId,
        message: data.message,
        read: false,
        receivedAt: new Date().toISOString(),
      };
      console.log("📩 New notification:", notif);
      setNotifications((prev) => [notif, ...prev]);
    });

    s.on("disconnect", () => {
      console.log("🛑 Socket disconnected");
    });

    // ✅ Correct cleanup — returns void
    return () => {
      s.disconnect();
      console.log("🧹 Socket cleaned up");
    };
  }, []);

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const clearAll = () => setNotifications([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markRead, clearAll }}>
      {children}
    </SocketContext.Provider>
  );
};
