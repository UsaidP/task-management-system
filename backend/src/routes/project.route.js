import { Router } from "express"
import {
	createProject,
	deleteProject,
	getAllProjects,
	getProjectById,
	updateProject,
} from "../controllers/project.controller.js"
import { protect, validateProjectPermission } from "../middlewares/auth.middleware.js"
import { ProjectRoleEnum, UserRoleEnum } from "../utils/constants.js"

const router = Router()

const { OWNER, PROJECT_ADMIN, MEMBER } = ProjectRoleEnum
const { ADMIN } = UserRoleEnum

// Create project - any authenticated user
router.post("/create", protect, createProject)

// Update project - Owner, Project Admin, or Global Admin
router.post(
	"/update/:projectId",
	protect,
	validateProjectPermission(ADMIN, OWNER, PROJECT_ADMIN),
	updateProject,
)

// Get project by ID - Any member
router.get(
	"/get-project-by-id/:projectId",
	protect,
	validateProjectPermission(ADMIN, OWNER, PROJECT_ADMIN, MEMBER),
	getProjectById,
)

// Delete project - Owner or Global Admin ONLY
router.post("/delete/:projectId", protect, validateProjectPermission(ADMIN, OWNER), deleteProject)

// Get all projects - any authenticated user
router.get("/all-projects", protect, getAllProjects)

export default router
