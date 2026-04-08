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

// Existing: Get all tasks for user
router.route("/:id").get(protect, asyncHandler(getAllTasks))

// Admin dashboard endpoints (require admin role)
router.get("/admin/stats", protect, requireAdmin, getAdminStats)
router.get("/admin/projects", protect, requireAdmin, getAdminProjectProgress)
router.get("/admin/recent-tasks", protect, requireAdmin, getAdminRecentTasks)
router.get("/admin/task-distribution", protect, requireAdmin, getAdminTaskDistribution)
router.get("/admin/weekly-stats", protect, requireAdmin, getAdminWeeklyStats)

// Public user list (admin managed, no route-level auth needed beyond requireAdmin)
router.get("/admin/users", protect, requireAdmin, getAdminAllUsers)

export default router
