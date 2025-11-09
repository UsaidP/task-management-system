import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import BlacklistedToken from "../models/blacklistedToken.js"
import { ProjectMember } from "../models/projectmember.model.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"

// const extractTokenFromRequest = (req) => {
//   // Prefer Authorization header first as it's the standard
//   if (req.headers.authorization?.startsWith("Bearer ")) {
//     return req.headers.authorization.split(" ")[1]
//   }

//   // Fallback to cookies
//   if (req.cookies?.accessToken) {
//     return req.cookies.accessToken
//   }
//   if (req.cookies?.refreshToken) {
//     return req.cookies.refreshToken
//   }

//   return null
// }

export const protect = asyncHandler(async (req, res, next) => {
	try {
		// Get token from cookies (primary method)
		let token = req.cookies?.accessToken

		// Fallback to Authorization header
		if (!token && req.headers.authorization?.startsWith("Bearer")) {
			token = req.headers.authorization.split(" ")[1]
		}

		if (!token) {
			throw new ApiError(401, "Please login to access this resource")
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

		// Get user from token
		const user = await User.findById(decoded._id).select("-password")

		if (!user) {
			throw new ApiError(401, "User not found")
		}

		// Attach user to request
		req.user = user
		next()
	} catch (error) {
		if (error.name === "JsonWebTokenError") {
			throw new ApiError(401, "Invalid token")
		}
		if (error.name === "TokenExpiredError") {
			throw new ApiError(401, "Token expired. Please refresh your session.")
		}
		throw error
	}
})

export const validateProjectPermission = (allowedRoles = []) => {
	if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
		throw new Error("allowedRoles must be a non-empty array")
	}

	return asyncHandler(async (req, res, next) => {
		const { projectId } = req.params
		const userId = req.user._id

		console.log("Validating project permission for user:", userId, "on project:", projectId)
		// Validate projectId
		if ((!projectId, !mongoose.Types.ObjectId.isValid(projectId))) {
			throw new ApiError(400, "Invalid project ID.")
		}

		// Find user's membership in the project
		const membership = await ProjectMember.findOne({
			project: new mongoose.Types.ObjectId(projectId),
			user: new mongoose.Types.ObjectId(userId),
		}).lean()

		if (!membership) {
			throw new ApiError(403, "Access denied. You are not a member of this project.")
		}

		const userRole = membership.role

		// Check if user has required role
		if (!allowedRoles.includes(userRole)) {
			throw new ApiError(
				403,
				`Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${userRole}.`,
			)
		}

		// Attach role and membership to request for downstream use
		req.user.projectRole = userRole
		req.user.membershipId = membership._id

		next()
	})
}
export const validateTaskPermission = (allowedRoles = []) => {
	return asyncHandler(async (req, res, next) => {
		console.log("params", req.params)
		const { projectId } = req.params
		const userId = req.user?._id

		console.log("user", userId)
		console.log("taskID", projectId)
		console.log("project", new mongoose.Types.ObjectId(projectId))
		if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
			throw new ApiError(400, "Task Id is missing or invalid.")
		}
		if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
			throw new ApiError(400, "User Id is missing or invalid.")
		}

		const user = await ProjectMember.findOne({
			project: new mongoose.Types.ObjectId(projectId),
			user: new mongoose.Types.ObjectId(userId),
		})
		console.log(user)
		if (!user) {
			throw new ApiError(404, `You are not a part of this task.`)
		}
		const userRole = user.role
		console.log(userRole)
		req.user.role = userRole
		if (!allowedRoles.includes(userRole)) {
			throw new ApiError(403, "You do not have permission to perform this action.")
		}
		next()
	})
}
