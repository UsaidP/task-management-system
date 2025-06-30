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
  "/update/:id",
  protect,
  validateProjectPermission([UserRoleEnum.ADMIN]),
  asyncHandler(updateProject)
);
router.post("/get-project-by-id/:id", protect, asyncHandler(getProjectById));
router.post(
  "/delete/:id",
  protect,
  validateProjectPermission([UserRoleEnum.ADMIN]),
  asyncHandler(deleteProject)
);
router.get("/all-projects", protect, asyncHandler(getAllProjects));

export default router;
