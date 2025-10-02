import { Router } from "express";
import {
  createProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  updateProject,
} from "../controllers/project.controller.js";

import { asyncHandler } from "../utils/async-handler.js";
import { protect, validateProjectPermission } from "../middlewares/auth.middleware.js";
import { createProjectValidator } from "../validators/auth.validator.js";
import { UserRoleEnum } from "../utils/constants.js";

const router = Router();

router.post("/create", protect, asyncHandler(createProject));

router.post(
  "/update/:projectId",
  protect,
  validateProjectPermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
  asyncHandler(updateProject)
);
router.get(
  "/get-project-by-id/:projectId",
  protect,
  validateProjectPermission([
    UserRoleEnum.ADMIN,
    UserRoleEnum.PROJECT_ADMIN,
    UserRoleEnum.MEMBER,
  ]),
  asyncHandler(getProjectById)
);
router.post(
  "/delete/:projectId",
  protect,
  validateProjectPermission([UserRoleEnum.ADMIN]),
  asyncHandler(deleteProject)
);
router.get("/all-projects", protect, asyncHandler(getAllProjects));

export default router;
