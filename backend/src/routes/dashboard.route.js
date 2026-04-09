import { Router } from "express"
import {
	getAdminAllUsers,
	getAdminProjectProgress,
	getAdminRecentTasks,
	getAdminStats,
	getAdminTaskDistribution,
	getAdminWeeklyStats,
} from "../controllers/adminDashboard.controller.js"
import { getAllTasks } from "../controllers/task.controller.js"
import { protect, requireAdmin } from "../middlewares/auth.middleware.js"
import { asyncHandler } from "../utils/async-handler.js"

const router = Router()

// Admin dashboard endpoints — must be defined BEFORE /:id to avoid route conflict
router.get("/admin/stats", protect, requireAdmin, getAdminStats)
router.get("/admin/projects", protect, requireAdmin, getAdminProjectProgress)
router.get("/admin/recent-tasks", protect, requireAdmin, getAdminRecentTasks)
router.get("/admin/task-distribution", protect, requireAdmin, getAdminTaskDistribution)
router.get("/admin/weekly-stats", protect, requireAdmin, getAdminWeeklyStats)
router.get("/admin/users", protect, requireAdmin, getAdminAllUsers)

// Generic: get all tasks for a project (keep last to avoid shadowing /admin/*)
router.route("/:id").get(protect, asyncHandler(getAllTasks))

export default router
