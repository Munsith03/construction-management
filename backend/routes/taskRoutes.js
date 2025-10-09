import express from "express";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  addComment,
  addIssue,
  updateChecklistItem,
  getTaskAnalytics,
  deleteTask,
} from "../controllers/taskController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

// Task CRUD operations
router.post("/", createTask);
router.get("/", getTasks);
router.get("/analytics", getTaskAnalytics);
router.get("/:id", getTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

// Task status management
router.patch("/:id/status", updateTaskStatus);

// Task interactions
router.post("/:id/comments", addComment);
router.post("/:id/issues", addIssue);
router.patch("/:id/checklist/:itemId", updateChecklistItem);

export default router;
