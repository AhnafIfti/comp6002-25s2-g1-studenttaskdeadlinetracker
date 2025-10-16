import { Request, Response } from "express";
import Task from "../model/task";
import Subtask from "../model/subtask";
import mongoose from "mongoose";

/**
 * Helper: verify assignee is allowed for this parent task
 * - if parent.groupstatus === 'individual' => assignee must equal parent.userId
 * - if parent.groupstatus === 'group' => assignee must be either parent.userId or in parent.sharedWith
 */
async function isAssigneeAllowed(
  parentTask: any,
  assigneeId: mongoose.Types.ObjectId
) {
  if (!parentTask) return false;
  if (parentTask.groupstatus === "individual") {
    return parentTask.userId.toString() === assigneeId.toString();
  } else {
    // group: allow parent owner or anyone in sharedWith
    if (
      parentTask.userId &&
      parentTask.userId.toString() === assigneeId.toString()
    )
      return true;
    if (Array.isArray(parentTask.sharedWith)) {
      return parentTask.sharedWith.some(
        (u: any) => u.toString() === assigneeId.toString()
      );
    }
    return false;
  }
}

export const createSubtask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const parentTask = await Task.findById(taskId).lean();
    if (!parentTask)
      return res.status(404).json({ message: "Parent task not found" });

    const { title, description, dueDate, dueTime, status, assignee } =
      req.body;

    if (!title || !dueDate || !dueTime || !assignee) {
      return res
        .status(400)
        .json({
          message: "title, dueDate, dueTime, assignee are required",
        });
    }

    const assigneeId = new mongoose.Types.ObjectId(assignee);

    // enforce assignee business rules
    const allowed = await isAssigneeAllowed(parentTask, assigneeId);
    if (!allowed) {
      return res
        .status(400)
        .json({
          message:
            "Assignee is not allowed for this subtask according to parent task rules",
        });
    }

    // Ensure groupstatus/courseId come from parentTask (user can't override)
    const subtaskDoc = new Subtask({
      title,
      description,
      dueDate,
      dueTime,
      status: status || "pending",
      groupstatus: parentTask.groupstatus,
      courseId: parentTask.courseId,
      parentTask: parentTask._id,
      assignee: assigneeId,
    });

    const saved = await subtaskDoc.save();

    // attach to parent
    await Task.findByIdAndUpdate(parentTask._id, {
      $push: { subtasks: saved._id },
    });

    return res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};

export const listSubtasksForTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const subtasks = await Subtask.find({ parentTask: taskId })
      .populate("assignee userId")
      .exec();
    return res.json(subtasks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};

export const getSubtask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subtask = await Subtask.findById(id)
      .populate("assignee userId parentTask")
      .exec();
    if (!subtask) return res.status(404).json({ message: "Subtask not found" });
    return res.json(subtask);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};

export const updateSubtask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Prevent overriding inherited fields
    delete updates.groupstatus;
    delete updates.courseId;
    delete updates.parentTask; // parent should not be changed here

    const existing = await Subtask.findById(id);
    if (!existing)
      return res.status(404).json({ message: "Subtask not found" });

    // If assignee is changing, verify against parent task rules
    if (
      updates.assignee &&
      updates.assignee.toString() !== existing.assignee.toString()
    ) {
      const parentTask = await Task.findById(existing.parentTask).lean();
      if (!parentTask)
        return res.status(400).json({ message: "Parent task missing" });

      const allowed = await isAssigneeAllowed(
        parentTask,
        new mongoose.Types.ObjectId(updates.assignee)
      );
      if (!allowed)
        return res
          .status(400)
          .json({ message: "Assignee not allowed for this subtask" });
    }

    Object.assign(existing, updates);
    const saved = await existing.save();
    return res.json(saved);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};

export const deleteSubtask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subtask = await Subtask.findByIdAndDelete(id);
    if (!subtask) return res.status(404).json({ message: "Subtask not found" });
    // remove reference from parent task
    await Task.findByIdAndUpdate(subtask.parentTask, {
      $pull: { subtasks: subtask._id },
    });
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};
