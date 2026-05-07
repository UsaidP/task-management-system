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

router
	.route("/:projectId")
	// Get all members - Any member can view
	.get(
		protect,
		validateProjectPermission(ADMIN, OWNER, PROJECT_ADMIN, MEMBER),
		projectMemberController.getAllMembers,
	)
	// Add member - Owner, Project Admin, or Global Admin
	.post(protect, validateProjectPermission(ADMIN, OWNER, PROJECT_ADMIN), addMember)
	// Update member role - Owner, Project Admin, or Global Admin
	.put(protect, validateProjectPermission(ADMIN, OWNER, PROJECT_ADMIN), updateMember)

// Remove member - Owner, Project Admin, or Global Admin
router
	.route("/:projectId/:memberId")
	.delete(protect, validateProjectPermission(ADMIN, OWNER, PROJECT_ADMIN), removeMember)

export default router
