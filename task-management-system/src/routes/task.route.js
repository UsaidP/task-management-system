import { Router } from "express";

const router = Router();

// Importing controllers
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from "../controllers/task.controller.js";
import {
  protect,
  validateProjectPermission,
  validateTaskPermission,
} from "../middlewares/auth.middleware.js";
import { UserRoleEnum } from "../utils/constants.js";
import { asyncHandler } from "../utils/async-handler.js";

router
  .route("/:projectId")
  .get(protect, validateTaskPermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]), getTasks)
  .post(protect, createTask);

router
  .route("/:projectId")
  .post(
    protect,
    validateProjectPermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
    asyncHandler(createTask)
  )
  .get(
    protect,
    validateProjectPermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
    asyncHandler(getTasks)
  );

router
  .route("/:projectId/n/:taskId")
  .get(protect, asyncHandler(getTaskById))
  .put(
    protect,
    validateTaskPermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
    asyncHandler(updateTask)
  )
  .delete(
    protect,
    validateTaskPermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
    asyncHandler(deleteTask)
  );
// router.post("/get-all-tasks", protect, getTasks);
// router.post("/update/:id", protect, updateTask);
// router.post("/delete/:id", protect, deleteTask);
export default router;
