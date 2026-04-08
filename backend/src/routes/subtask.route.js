import { Router } from "express"
import {
	createSubTask,
	deleteSubTask,
	getSubTaskById,
	getSubTasksForTask,
	updateSubTask,
} from "../controllers/subtask.controller.js"
import { protect, requireProjectAccess } from "../middlewares/auth.middleware.js"
import { ProjectRoleEnum, UserRoleEnum } from "../utils/constants.js"

const router = Router()

const { OWNER, PROJECT_ADMIN, MEMBER } = ProjectRoleEnum
const { ADMIN } = UserRoleEnum
const allRoles = [ADMIN, OWNER, PROJECT_ADMIN, MEMBER]

// All subtask routes require authentication
router.use(protect)

// Get/create subtasks for a task - resolves projectId from the task's project
router
	.route("/:taskId")
	.post(requireProjectAccess("task", ...allRoles), createSubTask)
	.get(requireProjectAccess("task", ...allRoles), getSubTasksForTask)

// Individual subtask operations - resolves projectId from the subtask's task
router.route("/subtask/:subtaskId").get(requireProjectAccess("subtask", ...allRoles), getSubTaskById).put(requireProjectAccess("subtask", ...allRoles), updateSubTask).delete(requireProjectAccess("subtask", ...allRoles), deleteSubTask)

export default router
