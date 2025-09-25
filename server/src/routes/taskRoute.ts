import express from "express";
import { 
    addTask,
    updateTaskStatus,
    getTasksByStatus, 
    getTaskById,deleteTask, 
    updateTask,
    getTaskByDueDate,
    getTasksByWeek,
    getTasksByCourseId,
    getAllTasks,
    getTaskStatusStats,
    getTaskStatsByCourse,
    getTaskStatsByTime,
    getTaskCompletionRates
    } from "../controllers/taskController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

// Route to add a new task
router.get("/by-week", authenticate, getTasksByWeek);

router.get("/by-due-date", authenticate, getTaskByDueDate);

router.get('/by-course-id', authenticate, getTasksByCourseId);

router.get("/all", authenticate, getAllTasks);

router.post("/add", authenticate, addTask);

router.put("/update-status", authenticate, updateTaskStatus);

router.get("/by-status", authenticate, getTasksByStatus);

// analytics route
router.get("/status-stats", authenticate, getTaskStatusStats);

router.get("/course-stats", authenticate, getTaskStatsByCourse);

router.get("/time-stats", authenticate, getTaskStatsByTime);

router.get("/completion-rates", authenticate, getTaskCompletionRates);


// basic CRUD routes
router.get("/:id", authenticate, getTaskById);

router.delete("/:id", authenticate, deleteTask);

router.put("/:id", authenticate, updateTask);

export default router;