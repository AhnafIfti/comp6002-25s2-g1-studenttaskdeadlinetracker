import mongoose, { Schema, Document, ValidatorProps } from "mongoose";

// Define the ITask interface
export interface ITask extends Document {
  title: string;
  description?: string;
  dueDate: Date;
  dueTime: string; // Time in HH:mm format (e.g., "10:07")
  status: "pending" | "in-progress" | "completed" | "overdue";
  groupstatus: "individual" | "group"; // Indicates if the task is individual or group
  courseId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // The user who created the task
  sharedWith?: mongoose.Types.ObjectId[]; // List of user IDs the task is shared with
  subtasks?: mongoose.Types.ObjectId[];
  groupId?: mongoose.Types.ObjectId; // added
  createdAt: Date;
  updatedAt: Date;
}

// Define the Task schema
const TaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, // Remove extra spaces
    },
    description: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    dueTime: {
      type: String, // Time in HH:mm format
      required: true,
      validate: {
        validator: function (v: string) {
          return /^([01]\d|2[0-3]):([0-5]\d) (AM|PM)$/.test(v); // Validate HH:mm format
        },
        message: (props: ValidatorProps) =>
          `${props.value} is not a valid time format!`,
      },
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "overdue"], // Restrict to specific values
      default: "pending",
    },
    groupstatus: {
      type: String,
      enum: ["individual", "group"], // Restrict to "individual" or "group"
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group", // added
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
      },
    ],
    subtasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subtask",
      },
    ],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create and export the Task model
const Task = mongoose.model<ITask>("Task", TaskSchema);
export default Task;