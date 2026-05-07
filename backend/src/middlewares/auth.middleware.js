import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import BlacklistedToken from "../models/blacklistedToken.js"
import { ProjectMember } from "../models/projectmember.model.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import { hasHigherOrEqualRole, ROLE_PERMISSIONS, UserRoleEnum } from "../utils/constants.js"

// ─────────────────────────────────────────────────────────────────────────────
// In-Memory LRU Cache for Project Permissions
// ─────────────────────────────────────────────────────────────────────────────
class PermissionCache {
	constructor(maxSize = 500, ttlMs = 5 * 60 * 1000) {
		this.cache = new Map()
		this.maxSize = maxSize
		this.ttlMs = ttlMs
	}

	_getKey(userId, projectId) {
		return `${userId}:${projectId}`
	}

	get(userId, projectId) {
		const key = this._getKey(userId, projectId)
		const entry = this.cache.get(key)
		if (!entry) return null
		if (Date.now() > entry.expiresAt) {
			this.cache.delete(key)
			return null
		}
		// Move to end (most recently used)
		this.cache.delete(key)
		this.cache.set(key, entry)
		return entry.data
	}

	set(userId, projectId, data) {
		const key = this._getKey(userId, projectId)
		// Evict oldest entry if at capacity
		if (this.cache.size >= this.maxSize) {
			const oldestKey = this.cache.keys().next().value
			this.cache.delete(oldestKey)
		}
		this.cache.set(key, {
			data,
			expiresAt: Date.now() + this.ttlMs,
		})
	}

	invalidate(userId, projectId) {
		const key = this._getKey(userId, projectId)
		this.cache.delete(key)
	}

	// Invalidate all entries for a user (useful on logout/delete)
	invalidateUser(userId) {
		for (const key of this.cache.keys()) {
			if (key.startsWith(`${userId}:`)) {
				this.cache.delete(key)
			}
		}
	}
}

// Singleton cache instance (5 min TTL, 500 entries)
const permissionCache = new PermissionCache()

// ─────────────────────────────────────────────────────────────────────────────
// 1. Verify JWT & Attach User
// ─────────────────────────────────────────────────────────────────────────────
export const protect = asyncHandler(async (req, _res, next) => {
	let token = req.cookies?.accessToken

	if (!token && req.headers.authorization?.startsWith("Bearer")) {
		token = req.headers.authorization.split(" ")[1]
	}

	if (!token) {
		throw new ApiError(401, "Please login to access this resource")
	}

	const isBlacklisted = await BlacklistedToken.findOne({ token })
	if (isBlacklisted) {
		throw new ApiError(401, "Token has been invalidated. Please login again.")
	}

	let decoded
	try {
		decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			throw new ApiError(401, "Token expired. Please login again.")
		}
		throw new ApiError(401, "Invalid token")
	}

	const user = await User.findById(decoded._id).select("-password")
	if (!user) throw new ApiError(401, "Account not found. Please log in again.")

	// Reject tokens issued before the last password change
	if (user.passwordChangedAt) {
		const tokenIssuedAt = decoded.iat * 1000 // iat is in seconds
		const passwordChangedAt = new Date(user.passwordChangedAt).getTime()
		if (tokenIssuedAt < passwordChangedAt) {
			throw new ApiError(401, "Token has been invalidated. Please login again.")
		}
	}

	req.user = user
	next()
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Validate Project Permission (covers both project AND task routes)
// ─────────────────────────────────────────────────────────────────────────────
export const validateProjectPermission = (...allowedRoles) => {
	return asyncHandler(async (req, _res, next) => {
		const { projectId } = req.params

		if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
			throw new ApiError(400, "Invalid or missing project ID")
		}

		// Global admin bypass
		if (req.user.role === UserRoleEnum.ADMIN) {
			req.user.projectRole = UserRoleEnum.ADMIN
			req.user.hasPermission = () => true
			return next()
		}

		// Check cache first
		const cached = permissionCache.get(req.user._id.toString(), projectId)
		if (cached) {
			req.user.projectRole = cached.role
			req.user.membershipId = cached.membershipId
			req.user.hasPermission = (permission) => {
				const permissions = ROLE_PERMISSIONS[cached.role] || []
				return permissions.includes(permission)
			}
			return next()
		}

		// Cache miss - query database
		const membership = await ProjectMember.findOne({
			isActive: true,
			project: new mongoose.Types.ObjectId(projectId),
			user: new mongoose.Types.ObjectId(req.user._id),
		}).lean()

		if (!membership) {
			// Check if project exists to provide better error code (404 vs 403)
			const { Project } = await import("../models/project.model.js")
			const projectExists = await Project.exists({ _id: projectId })

			if (!projectExists) {
				throw new ApiError(404, "Project not found")
			}

			console.warn(
				`[RBAC DENIED] User ${req.user._id} tried to access project ${projectId} - not a member`,
			)
			throw new ApiError(403, "Access denied. You are not a member of this project.")
		}

		const userRole = membership.role

		if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
			console.warn(
				`[RBAC DENIED] User ${req.user._id} has role "${userRole}", needs: ${allowedRoles.join(" or ")}`,
			)
			throw new ApiError(
				403,
				`Access denied. Required: ${allowedRoles.join(" or ")}. Your role: ${userRole}.`,
			)
		}

		// Cache the result
		permissionCache.set(req.user._id.toString(), projectId, {
			membershipId: membership._id.toString(),
			role: userRole,
		})

		req.user.projectRole = userRole
		req.user.membershipId = membership._id
		req.user.hasPermission = (permission) => {
			const permissions = ROLE_PERMISSIONS[userRole] || []
			return permissions.includes(permission)
		}

		next()
	})
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Permission-Based Middleware (must come after validateProjectPermission)
// ─────────────────────────────────────────────────────────────────────────────
export const requirePermission = (permission) => {
	return asyncHandler(async (req, _res, next) => {
		// Global admin — always passes
		if (req.user.role === UserRoleEnum.ADMIN) {
			return next()
		}

		// CRITICAL: Must have run validateProjectPermission first
		if (!req.user.projectRole) {
			throw new ApiError(
				500,
				"Server error: requirePermission must come after validateProjectPermission",
			)
		}

		const permissions = ROLE_PERMISSIONS[req.user.projectRole] || []
		if (!permissions.includes(permission)) {
			console.warn(
				`[RBAC DENIED] User ${req.user._id} denied permission "${permission}" (has role: ${req.user.projectRole})`,
			)
			throw new ApiError(403, `Permission denied: ${permission}`)
		}

		next()
	})
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Role Hierarchy Middleware
// ─────────────────────────────────────────────────────────────────────────────
export const validateRoleHierarchy = (minimumRole) => {
	return asyncHandler(async (req, _res, next) => {
		if (req.user.role === UserRoleEnum.ADMIN) {
			return next()
		}

		const userRole = req.user.projectRole || req.user.role

		if (!hasHigherOrEqualRole(userRole, minimumRole)) {
			console.warn(
				`[RBAC DENIED] User ${req.user._id} has role "${userRole}", needs: ${minimumRole} or higher`,
			)
			throw new ApiError(
				403,
				`Insufficient role. Required: ${minimumRole} or higher. Your role: ${userRole}`,
			)
		}

		next()
	})
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Require Global Admin
// ─────────────────────────────────────────────────────────────────────────────
export const requireAdmin = asyncHandler(async (req, _res, next) => {
	if (req.user.role !== UserRoleEnum.ADMIN) {
		throw new ApiError(403, "Admin access required")
	}
	next()
})

// ─────────────────────────────────────────────────────────────────────────────
// Export cache for invalidation in controllers (e.g., on member removal)
// ─────────────────────────────────────────────────────────────────────────────
export { permissionCache }

// ─────────────────────────────────────────────────────────────────────────────
// 6. Require Project Access via Task or Subtask
// Used when projectId is not directly in req.params.
// Resolves the target resource (task/subtask) to find its project,
// then delegates to validateProjectPermission.
// ─────────────────────────────────────────────────────────────────────────────
export const requireProjectAccess = (resourceType, ...allowedRoles) => {
	return asyncHandler(async (req, res, next) => {
		const { Task } = await import("../models/task.model.js")
		const { SubTask } = await import("../models/subtask.model.js")
		const { ProjectNote } = await import("../models/projectnote.model.js")
		const { Sprint } = await import("../models/sprint.model.js")

		const { taskId, subtaskId, noteId, sprintId } = req.params

		let projectId
		if (resourceType === "task") {
			if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
				throw new ApiError(400, "Invalid or missing task ID")
			}
			const task = await Task.findById(taskId).select("project").lean()
			if (!task) throw new ApiError(404, "Task not found")
			projectId = task.project
		} else if (resourceType === "subtask") {
			if (!subtaskId || !mongoose.Types.ObjectId.isValid(subtaskId)) {
				throw new ApiError(400, "Invalid or missing subtask ID")
			}
			const subtask = await SubTask.findById(subtaskId).select("task").lean()
			if (!subtask) throw new ApiError(404, "Subtask not found")
			const task = await Task.findById(subtask.task).select("project").lean()
			if (!task) throw new ApiError(404, "Parent task not found")
			projectId = task.project
		} else if (resourceType === "note") {
			if (!noteId || !mongoose.Types.ObjectId.isValid(noteId)) {
				throw new ApiError(400, "Invalid or missing note ID")
			}
			const note = await ProjectNote.findById(noteId).select("project").lean()
			if (!note) throw new ApiError(404, "Note not found")
			projectId = note.project
		} else if (resourceType === "sprint") {
			if (!sprintId || !mongoose.Types.ObjectId.isValid(sprintId)) {
				throw new ApiError(400, "Invalid or missing sprint ID")
			}
			const sprint = await Sprint.findById(sprintId).select("project").lean()
			if (!sprint) throw new ApiError(404, "Sprint not found")
			projectId = sprint.project
		}

		if (!projectId) {
			throw new ApiError(404, `${resourceType} not found or project not resolved`)
		}

		// Inject projectId into params so validateProjectPermission can use it
		req.params.projectId = projectId.toString()

		// Delegate to validateProjectPermission
		return validateProjectPermission(...allowedRoles)(req, res, next)
	})
}
