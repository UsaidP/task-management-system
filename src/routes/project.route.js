import { Router } from "express";
import {
  createProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  updateProject,
} from "../controllers/project.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", protect, asyncHandler(createProject));
router.post("/update/:id", protect, asyncHandler(updateProject));
router.post("/get-all-projects", protect, asyncHandler(getAllProjects));
router.post("/get-project-by-id/:id", protect, asyncHandler(getProjectById));
router.post("/delete/:id", protect, asyncHandler(deleteProject));
export default router;
