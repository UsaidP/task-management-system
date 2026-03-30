import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import BlacklistedToken from "../models/blacklistedToken.js"
import { ProjectMember } from "../models/projectmember.model.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import {
	hasHigherOrEqualRole,
	
	ROLE_PERMISSIONS,
	UserRoleEnum,
} from "../utils/constants.js"

// ─────────────────────────────────────────────────────────────────────────────
// 1. Verify JWT & Attach User
// ─────────────────────────────────────────────────────────────────────────────
export const protect = asyncHandler(async (req, res, next) => {
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
	if (!user) throw new ApiError(401, "User not found")

	req.user = user
	next()
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Validate Project Permission (covers both project AND task routes)
// ─────────────────────────────────────────────────────────────────────────────
export const validateProjectPermission = (...allowedRoles) => {
	return asyncHandler(async (req, res, next) => {
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

		const membership = await ProjectMember.findOne({
			isActive: true,
			project: new mongoose.Types.ObjectId(projectId),
			user: new mongoose.Types.ObjectId(req.user._id),
		}).lean()

		if (!membership) {
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
	return asyncHandler(async (req, res, next) => {
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
	return asyncHandler(async (req, res, next) => {
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
