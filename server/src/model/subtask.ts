import mongoose, { Schema, Document, ValidatorProps } from "mongoose";

export interface ISubtask extends Document {
  title: string;
  description?: string;
  dueDate: Date;
  dueTime: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  groupstatus: "individual" | "group"; // inherited from parent task, not user-editable
  courseId?: mongoose.Types.ObjectId; // inherited from parent task
  parentTask: mongoose.Types.ObjectId; // reference to parent Task
  assignee: mongoose.Types.ObjectId; // assigned user (rules enforced in controller)
  createdAt: Date;
  updatedAt: Date;
}

const SubtaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
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
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          // keep same format/validation style as Task model
          return /^([01]\d|2[0-3]):([0-5]\d) (AM|PM)$/.test(v);
        },
        message: (props: ValidatorProps) =>
          `${props.value} is not a valid time format!`,
      },
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "overdue"],
      default: "pending",
    },
    groupstatus: {
      type: String,
      enum: ["individual", "group"],
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    parentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Subtask = mongoose.model<ISubtask>("Subtask", SubtaskSchema);
export default Subtask;
