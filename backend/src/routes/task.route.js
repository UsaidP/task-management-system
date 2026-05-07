import { Router } from "express"

import {
	createTask,
	deleteAttachment,
	deleteComment,
	deleteTask,
	getAllTasks,
	getTaskById,
	getTasks,
	updateTask,
	uploadAttachment,
} from "../controllers/task.controller.js"
import { protect, requireProjectAccess, validateProjectPermission } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import { ProjectRoleEnum, UserRoleEnum } from "../utils/constants.js"
import { asyncHandler } from "../utils/async-handler.js"

const router = Router()

const { OWNER, PROJECT_ADMIN, MEMBER } = ProjectRoleEnum
const { ADMIN } = UserRoleEnum

// Role arrays for cleaner route definitions
const allRoles = [ADMIN, OWNER, PROJECT_ADMIN, MEMBER]
const adminRoles = [ADMIN, OWNER, PROJECT_ADMIN]

// ── ✅ Unified Task Routes ──────────────────────────────────────────────────
// Supports:
// 1. GET /api/v1/tasks?projectId=... -> Project tasks (with permission check)
// 2. GET /api/v1/tasks -> All tasks for user across all projects
router.route("/").get(
	protect,
	asyncHandler(async (req, res, next) => {
		if (req.query.projectId) {
			req.params.projectId = req.query.projectId
			return validateProjectPermission(...allRoles)(req, res, next)
		}
		next()
	}),
	asyncHandler(async (req, res, next) => {
		if (req.query.projectId) {
			return getTasks(req, res, next)
		}
		return getAllTasks(req, res, next)
	}),
)

// Create task - requires projectId in body or query if not in path
// But tests use POST /api/v1/tasks/:projectId
router
	.route("/:projectId")
	.post(protect, validateProjectPermission(...allRoles), createTask)
	.get(protect, validateProjectPermission(...allRoles), getTasks)

// Get, Update, Delete single task - use requireProjectAccess for resource-based routing
router
	.route("/t/:taskId")
	.get(protect, requireProjectAccess("task", ...allRoles), getTaskById)
	.put(protect, requireProjectAccess("task", ...allRoles), updateTask)
	.delete(protect, requireProjectAccess("task", ...adminRoles), deleteTask)

// Backwards compatibility for /:projectId/:taskId
router
	.route("/:projectId/:taskId")
	.get(protect, validateProjectPermission(...allRoles), getTaskById)
	.put(protect, validateProjectPermission(...allRoles), updateTask)
	.delete(protect, validateProjectPermission(...adminRoles), deleteTask)

// ── Attachments ──────────────────────────────────────────────────────────────

// Upload attachment - permission check BEFORE multer
router.route("/:projectId/:taskId/attachments").post(
	protect,
	validateProjectPermission(...allRoles), // ✅ Permission checked FIRST
	upload.single("file"), // ✅ Then file uploaded
	uploadAttachment,
)

// Delete attachment - Admin roles only
router
	.route("/:projectId/:taskId/attachments/:attachmentIndex")
	.delete(protect, validateProjectPermission(...adminRoles), deleteAttachment)

// ── Comments ─────────────────────────────────────────────────────────────────

// Delete comment - Admin roles only
router
	.route("/:projectId/:taskId/comments/:commentId")
	.delete(protect, validateProjectPermission(...adminRoles), deleteComment)

export default router
