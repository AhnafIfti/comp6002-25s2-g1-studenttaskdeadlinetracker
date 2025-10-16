import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoute'; // Import the user routes
import courseRoutes from './routes/courseRoute'; // Import the course routes
import taskRoutes from './routes/taskRoute'; // Import the task routes
import groupRoutes from "./routes/userGroupRoute";
import { createServer } from "http";
import { Server } from "socket.io";
import startNotificationScheduler from "./utils/notificationScheduler";
import subtaskRoutes from "./routes/subTaskRoute";

dotenv.config(); // Load environment variables from .env

const app = express();
const server = createServer(app);

// 🧠 Connected users map (userId → socket.id)
export const connectedUsers = new Map<string, string>();

// 🔌 Setup Socket.IO
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || '';
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Mount the user routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/tasks', taskRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api", subtaskRoutes);

// 🧩 Socket.IO unified connection handler
io.on("connection", (socket) => {
  console.log("🔌 A user connected:", socket.id);

  // Handle registration (from frontend)
  socket.on("register", (userId: string) => {
    if (!userId) return;
    connectedUsers.set(userId, socket.id);
    socket.join(userId);
    console.log(`📱 User ${userId} registered with socket ${socket.id}`);
  });

  // Backward compatibility: handle `registerUser` as well
  socket.on("registerUser", (userId: string) => {
    if (!userId) return;
    connectedUsers.set(userId, socket.id);
    socket.join(userId);
    console.log(`🟢 User ${userId} registered (via registerUser) with socket ${socket.id}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    for (const [userId, id] of connectedUsers.entries()) {
      if (id === socket.id) {
        connectedUsers.delete(userId);
        console.log(`🗑 Removed mapping for user ${userId}`);
      }
    }
    console.log("❌ A user disconnected:", socket.id);
  });
});

// 🔔 Manual test route (for debugging only)
app.post("/test-alert", (req, res) => {
  const { userId, taskId, title, dueAt, dueTime, courseId, message } = req.body;

  if (!userId || !taskId) {
    return res.status(400).json({ success: false, message: "Missing userId or taskId" });
  }

  io.to(userId).emit("deadlineAlert", {
    taskId,
    title,
    dueAt,
    dueTime,
    courseId,
    message: message || `Test notification for task "${title}"`,
  });

  console.log(`📢 Sent test alert to ${userId}`);
  return res.json({ success: true, message: "Notification sent" });
});

// 🕒 Start automatic notification scheduler
startNotificationScheduler(io, connectedUsers);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
