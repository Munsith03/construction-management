// server/routes/projectRoutes.js
import { Router } from "express";
import {
  getProjects, getProject, createProject, updateProject, deleteProject,
  refreshWeather,
} from "../controllers/projectController.js";

const router = Router();
// (Optional: add auth middleware here)

router.get("/", getProjects);
router.get("/:id", getProject);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// Weather refresh
router.post("/:id/refresh-weather", refreshWeather);

export default router;
