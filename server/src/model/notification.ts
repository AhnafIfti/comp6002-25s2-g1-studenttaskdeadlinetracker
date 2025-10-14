// src/model/notification.ts
import mongoose from 'mongoose';

export interface INotification extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  dueAt: Date;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    dueAt: { type: Date, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
