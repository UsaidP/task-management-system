import { Router } from "express"

import {
	createNotes,
	deleteNote,
	getNoteById,
	getNotes,
	updateNote,
} from "../controllers/note.controller.js"
import { protect, validateProjectPermission } from "../middlewares/auth.middleware.js"
import { ProjectRoleEnum, UserRoleEnum } from "../utils/constants.js"

const router = Router()

const { OWNER, PROJECT_ADMIN, MEMBER } = ProjectRoleEnum
const { ADMIN } = UserRoleEnum
const allRoles = [ADMIN, OWNER, PROJECT_ADMIN, MEMBER]
const adminRoles = [ADMIN, OWNER, PROJECT_ADMIN]

router
	.route("/:projectId/n/:noteId")
	.get(protect, validateProjectPermission(...allRoles), getNoteById)
	.put(protect, validateProjectPermission(...adminRoles), updateNote)
	.delete(protect, validateProjectPermission(...adminRoles), deleteNote)

router
	.route("/:projectId")
	.post(protect, validateProjectPermission(...adminRoles), createNotes)
	.get(protect, validateProjectPermission(...allRoles), getNotes)

export default router
