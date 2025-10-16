import { Request, Response } from "express";
import Task from "../model/task";
import Course from "../model/course";
import mongoose from "mongoose";
import Group from "../model/group";
import User from "../model/user";
import Subtask from "../model/subtask";

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

// Add Task Controller
export const addTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      dueDate,
      dueTime,
      groupstatus,
      courseId,
      sharedWith,
      groupId,
    } = req.body;

    const userId = req.user?.id;

    if (!title || !dueDate || !dueTime || !groupstatus) {
      res.status(400).json({ error: "Missing required fields: title, dueDate, dueTime, groupstatus, or userId." });
      return;
    }

    const existingTask = await Task.findOne({ title, dueDate, dueTime, userId });
    if (existingTask) {
      res.status(400).json({ error: "Task with the same title, due date, and time already exists." });
      return;
    }

    const newTask = new Task({
      title,
      description,
      dueDate,
      dueTime,
      status: "pending",
      groupstatus,
      courseId,
      userId,
      groupId,
      sharedWith,
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getAllTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized. User ID is required." });
      return;
    }

    const tasks = await Task.find({ userId });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Update Task Status Controller
export const updateTaskStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { taskId, status } = req.body;

    // Validate status
    if (!["pending", "in-progress", "completed", "overdue"].includes(status)) {
      res.status(400).json({ error: "Invalid status value." });
      return;
    }

    const userId = req.user?.id;

    // Find the task and ensure it belongs to the user
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      res.status(404).json({ error: "Task not found or not authorized." });
      return;
    }

    // Update the task status
    task.status = status;
    const updatedTask = await task.save();

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get Tasks by Status Controller
export const getTasksByStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { status } = req.query;

    // Validate status
    if (status && !["pending", "in-progress", "completed", "overdue"].includes(status as string)) {
      res.status(400).json({ error: "Invalid status value." });
      return;
    }

    // Define query object with dynamic properties
    const query: { userId?: string; status?: string } = {};
    if (userId !== undefined) {
     query.userId = userId;
     }

    // Add status to query if provided
    if (status) {
      query.status = status as string;
    }

    // Fetch tasks by query
    const tasks = await Task.find(query).populate({
      path: 'courseId',
      select: 'code',
    });

    const tasksWithCourseCode = tasks.map((task) => ({
      ...task.toObject(),
      courseCode: (task.courseId as any)?.code || null,
    }));

    res.status(200).json(tasksWithCourseCode);
  } catch (error) {
    console.error("Error fetching tasks by status:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get Task by ID Controller
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id).populate({
      path: "courseId",
      select: "code",
    });

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    // fetch subtasks for this task and populate assignee + creator
    const subtasks = await Subtask.find({ parentTask: id });

    res.status(200).json({
      ...task.toObject(),
      courseCode: (task.courseId as any)?.code || null,
      subtasks,
    });
  } catch (error) {
    console.error('Error fetching task by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized. User ID is required.' });
      return;
    }

    const deletedTask = await Task.findOneAndDelete({ _id: id, userId });

    if (!deletedTask) {
      res.status(404).json({ message: 'Task not found or not authorized.' });
      return;
    }

    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized. User ID is required.' });
      return;
    }

    const { description, dueDate, dueTime, status, groupstatus } = req.body;

    const updateFields: Partial<{
      description: string;
      dueDate: Date;
      dueTime: string;
      status: string;
      groupstatus: string;
    }> = {};

    if (description !== undefined) updateFields.description = description;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;
    if (dueTime !== undefined) updateFields.dueTime = dueTime;
    if (status !== undefined) updateFields.status = status;
    if (groupstatus !== undefined) updateFields.groupstatus = groupstatus;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      res.status(404).json({ message: 'Task not found or not authorized.' });
      return;
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getTaskByDueDate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const dueDateParam = req.query.dueDate as string | undefined;

    if (!dueDateParam) {
      res.status(400).json({ error: "Due date is required." });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: "Unauthorized. User ID is required." });
      return;
    }

    // Accept "YYYY-MM-DD" from UI or full ISO datetime.
    // Build UTC range for that calendar day to match stored ISO datetimes.
    let startOfDay: Date;
    let endOfDay: Date;

    if (/^\d{4}-\d{2}-\d{2}$/.test(dueDateParam)) {
      // date-only string -> interpret as UTC day
      startOfDay = new Date(`${dueDateParam}T00:00:00.000Z`);
      endOfDay = new Date(`${dueDateParam}T23:59:59.999Z`);
    } else {
      const parsed = new Date(dueDateParam);
      if (isNaN(parsed.getTime())) {
        res.status(400).json({ error: "Invalid dueDate format." });
        return;
      }
      // use the UTC calendar day of parsed date
      const y = parsed.getUTCFullYear();
      const m = parsed.getUTCMonth();
      const d = parsed.getUTCDate();
      startOfDay = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
      endOfDay = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));
    }

    const tasks = await Task.find({
      userId,
      dueDate: { $gte: startOfDay, $lte: endOfDay },
    }).populate({
      path: "courseId",
      select: "code",
    });

    const tasksWithCourseCode = tasks.map((task) => ({
      ...task.toObject(),
      courseCode: (task.courseId as any)?.code || null,
    }));

    res.status(200).json(tasksWithCourseCode);
  } catch (error) {
    console.error("Error fetching tasks by due date:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getTasksByWeek = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized. User ID is required." });
      return;
    }

    const today = new Date();
    const oneWeekLater = new Date();
    oneWeekLater.setDate(today.getDate() + 7);

    const tasks = await Task.find({
      userId,
      dueDate: { $gte: today.toISOString().split("T")[0], $lte: oneWeekLater.toISOString().split("T")[0] },
      status: { $in: ["pending", "in-progress"] },
    }).populate({
      path: "courseId",
      select: "code",
    });

    // 格式化任务数据
    const tasksWithCourseCode = tasks.map((task) => ({
      ...task.toObject(),
      courseCode: (task.courseId as any)?.code || null,
    }));

    res.status(200).json(tasksWithCourseCode);
  } catch (error) {
    console.error("Error fetching tasks for the week:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getTasksByCourseId = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.query;

    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required." });
    }

    const tasks = await Task.find({ courseId })
      .populate("courseId", "courseCode")
      .exec();

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks by course ID:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Analytic Functions
export const getTaskStatusStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized. User ID is required." });
      return;
    }

    const completed = await Task.countDocuments({ userId, status: "completed" });
    const pending = await Task.countDocuments({ userId, status: "pending" });
    const inProgress = await Task.countDocuments({ userId, status: "in-progress" });
    const overdue = await Task.countDocuments({ userId, status: "overdue" });

    res.status(200).json({ completed, pending, inProgress, overdue });
  } catch (error) {
    console.error("Error fetching task status stats:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getTaskStatsByCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    console.log("User ID:", userId);

    if (!userId) {
      res.status(401).json({ error: "Unauthorized. User ID is required." });
      return;
    }

    const tasks = await Task.find({ userId });
    console.log("Tasks for User:", tasks);

    const stats = await Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$courseId",
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } },
          overdue: { $sum: { $cond: [{ $eq: ["$status", "overdue"] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "courses", // 确保集合名称正确
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $project: {
          courseName: { $arrayElemAt: ["$course.name", 0] },
          total: 1,
          completed: 1,
          pending: 1,
          inProgress: 1,
          overdue: 1,
        },
      },
    ]);

    console.log("Aggregated Stats:", stats); // 调试日志，检查聚合结果

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching task stats by course:", error); // 调试日志，检查错误
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getTaskStatsByTime = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { timeUnit } = req.query;

    console.log("User ID:", userId);

    if (!userId) {
      res.status(401).json({ error: "Unauthorized. User ID is required." });
      return;
    }

    const groupBy =
      timeUnit === "month"
        ? { $month: "$createdAt" }
        : { $week: "$createdAt" };

    const stats = await Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: groupBy,
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          created: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log("Stats:", stats);

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching task stats by time:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getTaskCompletionRates = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    console.log("User ID:", userId);

    if (!userId) {
      res.status(401).json({ error: "Unauthorized. User ID is required." });
      return;
    }

    const tasks = await Task.find({ userId });
    console.log("Tasks for User:", tasks);

    const stats = await Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$courseId",
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $project: {
          courseName: { $arrayElemAt: ["$course.name", 0] },
          total: 1,
          completed: 1,
          completionRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
            ],
          },
        },
      },
    ]);

    console.log("Aggregated Stats:", stats);

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching task completion rates:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getAllowedAssignees = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { taskId } = req.params;
    if (!taskId) {
      res.status(400).json({ message: "taskId is required" });
      return;
    }

    const task = await Task.findById(taskId).lean();
    if (!task) {
      res.status(404).json({ message: "Parent task not found" });
      return;
    }

    // requester id from auth middleware if available
    const requesterId = (req as any).user?.id; // keep compatible with your Auth middleware

    if (task.groupstatus === "individual") {
      // only the requester allowed (or fallback to task owner)
      const targetId = requesterId || task.userId;
      const user = await User.findById(targetId)
        .select("_id name email")
        .lean();
      res.json(user ? [user] : []);
      return;
    }

    // group task -> gather members from group or sharedWith
    let memberIds: any[] = [];

    if (task.groupId) {
      const group = await Group.findById(task.groupId).lean();
      if (group && Array.isArray(group.members))
        memberIds = group.members.map((m: any) => m.toString());
    }

    if (
      (!memberIds || memberIds.length === 0) &&
      Array.isArray(task.sharedWith)
    ) {
      memberIds = task.sharedWith.map((m: any) => m.toString());
    }

    // ensure requester is included
    if (requesterId && !memberIds.includes(String(requesterId))) {
      memberIds.push(String(requesterId));
    }

    // fallback: include task owner if still empty
    if (memberIds.length === 0 && task.userId) {
      memberIds = [String(task.userId)];
    }

    const users = await User.find({ _id: { $in: memberIds } })
      .select("_id name email")
      .lean();

    res.json(users || []);
  } catch (err) {
    console.error("Error getting allowed assignees:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};