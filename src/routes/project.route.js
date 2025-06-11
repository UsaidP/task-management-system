import { Router } from "express";
import {
  createProject,
  updateProject,
} from "../controllers/project.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", protect, asyncHandler(createProject));
router.post("/update", protect, asyncHandler(updateProject));
export default router;
