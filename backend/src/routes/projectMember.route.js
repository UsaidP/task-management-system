import { Router } from "express"
import {
	addMember,
	projectMemberController,
	removeMember,
	updateMember,
} from "../controllers/projectMember.controller.js"
import {
	protect,
	validateProjectPermission,
} from "../middlewares/auth.middleware.js"
import { asyncHandler } from "../utils/async-handler.js"
import { UserRoleEnum } from "../utils/constants.js"

const router = Router()

router
	.route("/add/:projectId")
	.post(
		protect,
		validateProjectPermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
		asyncHandler(addMember),
	)
router
	.route("/update/:projectId")
	.post(
		protect,
		validateProjectPermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
		asyncHandler(updateMember),
	)
router
	.route("/remove/:projectId")
	.post(
		protect,
		validateProjectPermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
		asyncHandler(removeMember),
	)
router
	.route("/all-members/:projectId")
	.get(
		protect,
		validateProjectPermission([
			UserRoleEnum.ADMIN,
			UserRoleEnum.PROJECT_ADMIN,
			UserRoleEnum.MEMBER,
		]),
		asyncHandler(projectMemberController.getAllMembers),
	)
export default router
