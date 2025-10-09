import express from "express";
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  linkStaffToUser,
  getStaffForAssignees,
} from "../controllers/staffController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Staff routes
router.get("/", getAllStaff);
router.get("/assignees", getStaffForAssignees);
router.get("/:id", getStaffById);
router.post("/", createStaff);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);
router.post("/link-user", linkStaffToUser);

export default router;
