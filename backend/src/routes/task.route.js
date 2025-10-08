import { Router } from "express";

const router = Router();

// Importing controllers
import {
	createTask,
	deleteTask,
	getAllTasks,
	getTaskById,
	getTasks,
	updateTask,
} from "../controllers/task.controller.js";
import {
	protect,
	validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { UserRoleEnum } from "../utils/constants.js";

router
	.route("/:projectId")
	.post(protect, asyncHandler(createTask))
	.get(
		protect,
		validateProjectPermission([
			UserRoleEnum.ADMIN,
			UserRoleEnum.PROJECT_ADMIN,
			UserRoleEnum.MEMBER,
		]),
		asyncHandler(getTasks),
	);

router
	.route("/:projectId/:taskId")
	.get(
		protect,
		validateProjectPermission([
			UserRoleEnum.ADMIN,
			UserRoleEnum.PROJECT_ADMIN,
			UserRoleEnum.MEMBER,
		]),
		asyncHandler(getTaskById),
	)
	.put(
		protect,
		validateProjectPermission([
			UserRoleEnum.ADMIN,
			UserRoleEnum.PROJECT_ADMIN,
			UserRoleEnum.MEMBER,
		]),
		asyncHandler(updateTask),
	)
	.delete(
		protect,
		validateProjectPermission([
			UserRoleEnum.ADMIN,
			UserRoleEnum.PROJECT_ADMIN,
			UserRoleEnum.MEMBER,
		]),
		asyncHandler(deleteTask),
	);

export default router;
