import express from "express";
import {
  createSubtask,
  listSubtasksForTask,
  getSubtask,
  updateSubtask,
  deleteSubtask,
} from "../controllers/subTaskController";

const router = express.Router();

// Create subtask for a parent task
router.post("/tasks/:taskId/subtasks", createSubtask);

// List subtasks for a task
router.get("/tasks/:taskId/subtasks", listSubtasksForTask);

// Get a single subtask
router.get("/subtasks/:id", getSubtask);

// Update subtask
router.put("/subtasks/:id", updateSubtask);

// Delete subtask
router.delete("/subtasks/:id", deleteSubtask);

export default router;
