import { Router } from "express"

const router = Router()

import {
  assignTaskToSprint,
  completeSprint,
  createSprint,
  deleteSprint,
  getBacklog,
  getSprintById,
  getSprints,
  getSprintVelocity,
  removeTaskFromSprint,
  startSprint,
  updateSprint,
} from "../controllers/sprint.controller.js"
import { protect, requireProjectAccess, validateProjectPermission } from "../middlewares/auth.middleware.js"
import { ProjectRoleEnum, UserRoleEnum } from "../utils/constants.js"
import { asyncHandler } from "../utils/async-handler.js"
import ApiError from "../utils/api-error.js"
import mongoose from "mongoose"

const { OWNER, PROJECT_ADMIN, MEMBER } = ProjectRoleEnum
const { ADMIN } = UserRoleEnum
const allRoles = [ADMIN, OWNER, PROJECT_ADMIN, MEMBER]
const adminRoles = [ADMIN, OWNER, PROJECT_ADMIN]

// Middleware to extract projectId from body and put it in params for validation
const extractProjectIdForValidation = asyncHandler(async (req, _res, next) => {
  console.log("[DEBUG] Request body:", JSON.stringify(req.body, null, 2))
  const { projectId } = req.body
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid or missing project ID")
  }
  req.params.projectId = projectId
  next()
})

// Create sprint - must be project admin
router.post(
  "/",
  protect,
  extractProjectIdForValidation,
  validateProjectPermission(...adminRoles),
  createSprint,
)

// Get sprints by project - any member
router.get("/project/:projectId", protect, validateProjectPermission(...allRoles), getSprints)

// Get backlog - any member
router.get(
  "/project/:projectId/backlog",
  protect,
  validateProjectPermission(...allRoles),
  getBacklog,
)

// Get velocity - any member
router.get(
  "/project/:projectId/velocity",
  protect,
  validateProjectPermission(...allRoles),
  getSprintVelocity,
)

// Get/Update/Delete single sprint
router
  .route("/:sprintId")
  .get(protect, requireProjectAccess("sprint", ...allRoles), getSprintById)
  .put(protect, requireProjectAccess("sprint", ...adminRoles), updateSprint)
  .delete(protect, requireProjectAccess("sprint", ...adminRoles), deleteSprint)

// Start sprint - admin only
router.put("/:sprintId/start", protect, requireProjectAccess("sprint", ...adminRoles), startSprint)

// Complete sprint - admin only
router.put("/:sprintId/complete", protect, requireProjectAccess("sprint", ...adminRoles), completeSprint)

// Assign/remove tasks from sprint
router.put("/:sprintId/assign-task", protect, requireProjectAccess("sprint", ...adminRoles), assignTaskToSprint)
router.put("/task/:taskId/remove-from-sprint", protect, requireProjectAccess("task", ...adminRoles), removeTaskFromSprint)

export default router
