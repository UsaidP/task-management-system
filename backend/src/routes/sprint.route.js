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
import { protect, validateProjectPermission } from "../middlewares/auth.middleware.js"
import { ProjectRoleEnum, UserRoleEnum } from "../utils/constants.js"

const { OWNER, PROJECT_ADMIN, MEMBER } = ProjectRoleEnum
const { ADMIN } = UserRoleEnum
const allRoles = [ADMIN, OWNER, PROJECT_ADMIN, MEMBER]
const adminRoles = [ADMIN, OWNER, PROJECT_ADMIN]

// Create sprint - must be project member
router.post("/", protect, validateProjectPermission(...adminRoles), createSprint)

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
	.get(protect, getSprintById)
	.put(protect, updateSprint)
	.delete(protect, deleteSprint)

// Start sprint - admin only
router.put("/:sprintId/start", protect, startSprint)

// Complete sprint - admin only
router.put("/:sprintId/complete", protect, completeSprint)

// Assign/remove tasks from sprint
router.put("/:sprintId/assign-task", protect, assignTaskToSprint)
router.put("/task/:taskId/remove-from-sprint", protect, removeTaskFromSprint)

export default router
