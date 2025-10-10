import { Router } from "express"
import {
	createSubTask,
	deleteSubTask,
	getSubTaskById,
	getSubTasksForTask,
	updateSubTask,
} from "../controllers/subtask.controller.js"
import {
	protect,
	validateProjectPermission,
} from "../middlewares/auth.middleware.js"
import { asyncHandler } from "../utils/async-handler.js"
import { UserRoleEnum } from "../utils/constants.js"

const router = Router()

// All subtask routes should be protected
router.use(protect)

router
	.route("/:taskId")
	.post(asyncHandler(createSubTask))
	.get(asyncHandler(getSubTasksForTask))

router
	.route("/subtask/:subtaskId")
	.get(asyncHandler(getSubTaskById))
	.put(asyncHandler(updateSubTask))
	.delete(asyncHandler(deleteSubTask))

export default router
