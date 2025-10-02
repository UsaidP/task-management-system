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
} from "../middlewares/auth.middleware.js";
import { UserRoleEnum } from "../utils/constants.js";
import { asyncHandler } from "../utils/async-handler.js";

router
  .route("/:projectId")
  .post(
    protect,
    validateProjectPermission([
      UserRoleEnum.ADMIN,
      UserRoleEnum.PROJECT_ADMIN,
      UserRoleEnum.MEMBER,
    ]),
    asyncHandler(createTask)
  )
  .get(
    protect,
    validateProjectPermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN, UserRoleEnum.MEMBER]),
    asyncHandler(getTasks)
  );

router
  .route("/:projectId/:taskId")
  .get(
    protect,
    validateProjectPermission([
      UserRoleEnum.ADMIN,
      UserRoleEnum.PROJECT_ADMIN,
      UserRoleEnum.MEMBER,
    ]),
    asyncHandler(getTaskById)
  )
  .put(
    protect,
    validateProjectPermission([
      UserRoleEnum.ADMIN,
      UserRoleEnum.PROJECT_ADMIN,
      UserRoleEnum.MEMBER,
    ]),
    asyncHandler(updateTask)
  )
  .delete(
    protect,
    validateProjectPermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
    asyncHandler(deleteTask)
  );

export default router;
