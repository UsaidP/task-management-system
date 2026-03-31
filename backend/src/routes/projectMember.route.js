import { Router } from "express"
import {
	addMember,
	projectMemberController,
	removeMember,
	updateMember,
} from "../controllers/projectMember.controller.js"
import { protect, validateProjectPermission } from "../middlewares/auth.middleware.js"
import { ProjectRoleEnum, UserRoleEnum } from "../utils/constants.js"

const router = Router()

const { OWNER, PROJECT_ADMIN, MEMBER } = ProjectRoleEnum
const { ADMIN } = UserRoleEnum

// Add member - Owner, Project Admin, or Global Admin
router
	.route("/add/:projectId")
	.post(protect, validateProjectPermission(ADMIN, OWNER, PROJECT_ADMIN), addMember)

// Update member role - Owner, Project Admin, or Global Admin
router
	.route("/update/:projectId")
	.post(protect, validateProjectPermission(ADMIN, OWNER, PROJECT_ADMIN), updateMember)

// Remove member - Owner, Project Admin, or Global Admin
router
	.route("/remove/:projectId")
	.post(protect, validateProjectPermission(ADMIN, OWNER, PROJECT_ADMIN), removeMember)

// Get all members - Any member can view
router
	.route("/all-members/:projectId")
	.get(
		protect,
		validateProjectPermission(ADMIN, OWNER, PROJECT_ADMIN, MEMBER),
		projectMemberController.getAllMembers,
	)

export default router
