import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { getAllTasks } from "../controllers/task.controller.js";

const router = Router();
router.route("/:id").get(protect, asyncHandler(getAllTasks));

export default router;
