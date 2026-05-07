import { Router } from "express"

import {
	createNotes,
	deleteNote,
	getNoteById,
	getNotes,
	updateNote,
} from "../controllers/note.controller.js"
import { protect, requireProjectAccess, validateProjectPermission } from "../middlewares/auth.middleware.js"
import { ProjectRoleEnum, UserRoleEnum } from "../utils/constants.js"

const router = Router()

const { OWNER, PROJECT_ADMIN, MEMBER } = ProjectRoleEnum
const { ADMIN } = UserRoleEnum
const allRoles = [ADMIN, OWNER, PROJECT_ADMIN, MEMBER]
const adminRoles = [ADMIN, OWNER, PROJECT_ADMIN]

// ── Project-scoped note routes ───────────────────────────────────────────────
router
	.route("/p/:projectId")
	.post(protect, validateProjectPermission(...adminRoles), createNotes)
	.get(protect, validateProjectPermission(...allRoles), getNotes)

// ── Individual note operations ────────────────────────────────────────────────
router
	.route("/:noteId")
	.get(protect, requireProjectAccess("note", ...allRoles), getNoteById)
	.put(protect, requireProjectAccess("note", ...adminRoles), updateNote)
	.delete(protect, requireProjectAccess("note", ...adminRoles), deleteNote)

// Backwards compatibility for /:projectId/n/:noteId
router
	.route("/:projectId/n/:noteId")
	.get(protect, validateProjectPermission(...allRoles), getNoteById)
	.put(protect, validateProjectPermission(...adminRoles), updateNote)
	.delete(protect, validateProjectPermission(...adminRoles), deleteNote)

// Backwards compatibility for /:projectId
router
	.route("/:projectId")
	.post(protect, validateProjectPermission(...adminRoles), createNotes)
	.get(protect, validateProjectPermission(...allRoles), getNotes)

export default router
