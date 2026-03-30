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
import { protect } from "../middlewares/auth.middleware.js"
import { asyncHandler } from "../utils/async-handler.js"

router.route("/").post(protect, asyncHandler(createSprint))

router.route("/project/:projectId").get(protect, asyncHandler(getSprints))

router.route("/project/:projectId/backlog").get(protect, asyncHandler(getBacklog))

router.route("/project/:projectId/velocity").get(protect, asyncHandler(getSprintVelocity))

router
	.route("/:sprintId")
	.get(protect, asyncHandler(getSprintById))
	.put(protect, asyncHandler(updateSprint))
	.delete(protect, asyncHandler(deleteSprint))

router.route("/:sprintId/start").put(protect, asyncHandler(startSprint))

router.route("/:sprintId/complete").put(protect, asyncHandler(completeSprint))

router.route("/:sprintId/assign-task").put(protect, asyncHandler(assignTaskToSprint))

router.route("/task/:taskId/remove-from-sprint").put(protect, asyncHandler(removeTaskFromSprint))

export default router
