import { Project } from "../models/project.model.js"
import { Task } from "../models/task.model.js"
import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"

// ─────────────────────────────────────────────────────────────────────────────
// 1. Get Admin Dashboard Stats (global task counts by status)
// ─────────────────────────────────────────────────────────────────────────────
const getAdminStats = asyncHandler(async (_req, res) => {
	const now = new Date()

	// Count tasks by status across ALL projects
	const statusCounts = await Task.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])

	// Count overdue tasks (not completed/under-review/done, due before now)
	const overdueCount = await Task.countDocuments({
		dueDate: { $lt: now },
		status: { $in: ["todo", "in-progress"] },
	})

	// Total projects
	const totalProjects = await Project.countDocuments({ isActive: true })

	// Total users
	const { User } = await import("../models/user.model.js")
	const totalUsers = await User.countDocuments()

	const statusMap = Object.fromEntries(statusCounts.map((s) => [s._id, s.count]))

	const stats = {
		completed: statusMap.done || 0,
		inProgress: statusMap["in-progress"] || 0,
		overdue: overdueCount,
		todo: statusMap.todo || 0,
		totalProjects,
		totalTasks: Object.values(statusMap).reduce((a, b) => a + b, 0),
		totalUsers,
		underReview: statusMap["under-review"] || 0,
	}

	return res.status(200).json(new ApiResponse(200, stats, "Admin stats fetched"))
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Get Weekly Task Stats (for area chart)
// ─────────────────────────────────────────────────────────────────────────────
const getAdminWeeklyStats = asyncHandler(async (_req, res) => {
	const today = new Date()
	const sevenDaysAgo = new Date(today)
	sevenDaysAgo.setDate(today.getDate() - 6)
	sevenDaysAgo.setHours(0, 0, 0, 0)

	// Tasks created in the last 7 days
	const dailyCreated = await Task.aggregate([
		{
			$match: { createdAt: { $gte: sevenDaysAgo } },
		},
		{
			$group: {
				_id: {
					$dateToString: { date: "$createdAt", format: "%w" }, // 0=Sun, 1=Mon, etc.
				},
				count: { $sum: 1 },
			},
		},
	])

	// Tasks completed in the last 7 days
	const dailyCompleted = await Task.aggregate([
		{
			$match: {
				status: "done",
				updatedAt: { $gte: sevenDaysAgo },
			},
		},
		{
			$group: {
				_id: {
					$dateToString: { date: "$updatedAt", format: "%w" },
				},
				count: { $sum: 1 },
			},
		},
	])

	// Build array for the last 7 days (Mon-Sun order)
	const days = []
	for (let i = 6; i >= 0; i--) {
		const date = new Date(today)
		date.setDate(today.getDate() - i)
		days.push(date)
	}

	const createdMap = Object.fromEntries(dailyCreated.map((d) => [d._id, d.count]))
	const completedMap = Object.fromEntries(dailyCompleted.map((d) => [d._id, d.count]))

	const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

	const weeklyData = days.map((date) => {
		// %w returns "0" for Sunday, "1" for Monday, etc.
		const dayNum = String(date.getDay())
		return {
			completed: completedMap[dayNum] || 0,
			created: createdMap[dayNum] || 0,
			name: dayNames[date.getDay()],
			overdue: 0, // Computed separately
		}
	})

	return res.status(200).json(new ApiResponse(200, weeklyData, "Weekly stats fetched"))
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. Get All Projects with Progress (for project progress widget)
// ─────────────────────────────────────────────────────────────────────────────
const getAdminProjectProgress = asyncHandler(async (_req, res) => {
	const projectsWithProgress = await Project.find({ isActive: true }).lean()

	const projectProgress = await Promise.all(
		projectsWithProgress.map(async (project) => {
			const totalTasks = await Task.countDocuments({ project: project._id })
			const completedTasks = await Task.countDocuments({
				project: project._id,
				status: { $in: ["done", "completed"] },
			})
			const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
			return {
				_id: project._id.toString(),
				completedTasks,
				description: project.description || "",
				name: project.name,
				progress,
				totalTasks,
			}
		}),
	)

	return res.status(200).json(new ApiResponse(200, projectProgress, "Project progress fetched"))
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. Get All Users (admin team view)
// ─────────────────────────────────────────────────────────────────────────────
const getAdminAllUsers = asyncHandler(async (_req, res) => {
	const { User } = await import("../models/user.model.js")

	const users = await User.find().select(
		"fullname email username role avatar company jobTitle isEmailVerified createdAt",
	)

	// Enrich with task counts
	const usersWithStats = await Promise.all(
		users.map(async (user) => {
			const totalTasks = await Task.countDocuments({ assignedTo: user._id })
			const completedTasks = await Task.countDocuments({
				assignedTo: user._id,
				status: { $in: ["done", "completed"] },
			})
			return {
				_id: user._id.toString(),
				avatar: user.avatar?.url || "https://placehold.co/400",
				company: user.company || "",
				completedTasks,
				createdAt: user.createdAt,
				email: user.email,
				fullname: user.fullname,
				isEmailVerified: user.isEmailVerified,
				jobTitle: user.jobTitle || "",
				role: user.role,
				status: user.isEmailVerified ? "verified" : "pending",
				totalTasks,
				username: user.username,
			}
		}),
	)

	return res.status(200).json(new ApiResponse(200, usersWithStats, "All users fetched"))
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. Get Recent Tasks (for recent tasks table)
// ─────────────────────────────────────────────────────────────────────────────
const getAdminRecentTasks = asyncHandler(async (req, res) => {
	const { limit = 20 } = req.query

	const tasks = await Task.find()
		.populate("assignedTo", "fullname email avatar")
		.populate("createdBy", "fullname")
		.populate("project", "name")
		.sort({ createdAt: -1 })
		.limit(parseInt(limit, 10))

	return res.status(200).json(new ApiResponse(200, tasks, "Recent tasks fetched"))
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. Get Task Distribution (for pie chart — by priority)
// ─────────────────────────────────────────────────────────────────────────────
const getAdminTaskDistribution = asyncHandler(async (_req, res) => {
	const distribution = await Task.aggregate([
		{ $group: { _id: "$priority", count: { $sum: 1 } } },
		{ $sort: { count: -1 } },
	])

	const result = distribution.map((item) => ({
		name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
		value: item.count,
	}))

	return res.status(200).json(new ApiResponse(200, result, "Task distribution fetched"))
})

export {
	getAdminAllUsers,
	getAdminProjectProgress,
	getAdminRecentTasks,
	getAdminStats,
	getAdminTaskDistribution,
	getAdminWeeklyStats,
}
