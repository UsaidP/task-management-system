import { Router } from "express";

const router = Router();

// Importing controllers
import { createTask, getTasks } from "../controllers/task.controller.js";
import { protect, validateTaskPermission } from "../middlewares/auth.middleware.js";
import { UserRoleEnum } from "../utils/constants.js";

router
  .route("/:projectId")
  .get(protect, validateTaskPermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]), getTasks)
  .post(protect, createTask);
// router.post("/get-all-tasks", protect, getTasks);
// router.post("/update/:id", protect, updateTask);
// router.post("/delete/:id", protect, deleteTask);
export default router;
