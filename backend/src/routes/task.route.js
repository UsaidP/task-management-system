import { Router } from "express"
import fs from "fs"
import multer from "multer"
import path from "path"

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
import { protect, validateProjectPermission } from "../middlewares/auth.middleware.js"
import { ProjectRoleEnum, UserRoleEnum } from "../utils/constants.js"

// ── Multer setup ────────────────────────────────────────────────────────────
const uploadDir = path.join(process.cwd(), "uploads")
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true })
}

const upload = multer({ dest: uploadDir })
const router = Router()

const { OWNER, PROJECT_ADMIN, MEMBER } = ProjectRoleEnum
const { ADMIN } = UserRoleEnum

// Role arrays for cleaner route definitions
const allRoles = [ADMIN, OWNER, PROJECT_ADMIN, MEMBER]
const adminRoles = [ADMIN, OWNER, PROJECT_ADMIN]

// ── ✅ Static routes FIRST (before dynamic /:projectId) ─────────────────────
// Get all tasks for user across all projects
router.route("/tasks").get(protect, getAllTasks)

// ── Project-scoped task routes ───────────────────────────────────────────────

// Create task & Get all tasks for project
router
	.route("/:projectId")
	.post(protect, validateProjectPermission(...allRoles), createTask)
	.get(protect, validateProjectPermission(...allRoles), getTasks)

// Get, Update, Delete single task
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
