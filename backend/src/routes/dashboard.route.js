import e, { Router } from "express";
import { protect, validateProjectPermission } from "../middlewares/auth.middleware.js";
import { UserRoleEnum } from "../utils/constants.js";
import { asyncHandler } from "../utils/async-handler.js";
import { getAllTasks } from "../controllers/task.controller.js";

const router = Router();
router.route("/").get(protect, asyncHandler(getAllTasks));

export default router;
