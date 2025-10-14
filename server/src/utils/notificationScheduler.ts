// src/utils/notificationScheduler.ts
import { Server } from "socket.io";
import Task, { ITask } from "../model/task";

export default function startNotificationScheduler(
  io: Server,
  connectedUsers: Map<string, string>
) {
  console.log("🔔 Notification scheduler initialized...");

  // ✅ Track emitted notifications to avoid duplicates
  const emittedNotifications = new Set<string>();

  setInterval(async () => {
    try {
      const now = new Date();
      const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000); // next 24 hours

      console.log("⏱ Checking for upcoming tasks...");
      console.log("🕒 Now:", now.toISOString(), " Next 24h:", next24Hours.toISOString());

      const allTasks = await Task.find({ status: { $in: ["pending", "in-progress"] } });

      const upcomingTasks = allTasks.filter((task) => {
        if (!task.dueDate || !task.dueTime) return false;

        const parts = task.dueTime.split(" ");
        if (!parts || parts.length !== 2) return false;

        const [time, modifier] = parts;
        if (!time || !modifier) return false;

        const timeParts = time.split(":");
        if (!timeParts || timeParts.length !== 2) return false;

        const [hoursStr, minutesStr] = timeParts;
        if (!hoursStr || !minutesStr) return false;

        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);

        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        const dueDateTime = new Date(task.dueDate);
        dueDateTime.setHours(hours, minutes, 0, 0);

        return dueDateTime >= now && dueDateTime <= next24Hours;
      });

      console.log(`📊 Found tasks: ${upcomingTasks.length}`);

      for (const task of upcomingTasks) {
        const userId = task.userId?.toString();
        if (!userId) continue;

        const socketId = connectedUsers.get(userId);
        if (!socketId) {
          console.log(`⚠️ User ${userId} not connected. Skipping notification.`);
          continue;
        }

        // ✅ Deduplicate by taskId + userId
        const notificationKey = `${task._id}_${userId}`;
        if (emittedNotifications.has(notificationKey)) {
          continue; // Skip duplicate
        }
        emittedNotifications.add(notificationKey);

        // Retaining your current _id handling
        const taskId = task._id ? task._id.toString() : "unknown";

        io.to(socketId).emit("deadlineAlert", {
          taskId,
          title: task.title,
          dueAt: task.dueDate,
          dueTime: task.dueTime,
          courseId: task.courseId,
          message: `⏰ Your task "${task.title}" is due soon!`,
        });

        console.log(`📢 Auto-notification sent to user ${userId} for task "${task.title}"`);
      }
    } catch (err) {
      console.error("❌ Error in notification scheduler:", err);
    }
  }, 20 * 1000); // check every 20 seconds
}
