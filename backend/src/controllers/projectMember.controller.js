import { Project } from "../models/project.model.js"
import { ProjectMember } from "../models/projectmember.model.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import { AvailableProjectRole, ProjectRoleEnum, UserRoleEnum } from "../utils/constants.js"

export const addMember = asyncHandler(async (req, res, next) => {
	const { projectId } = req.params
	const { email, role } = req.body

	if (!projectId) {
		throw new ApiError(401, "Project Id not found from params")
	}
	if (!email) {
		throw new ApiError(403, "Email is required.")
	}
	if (!role) {
		throw new ApiError(403, "Role is required.")
	}

	const project = await Project.findById(projectId)
	if (!project) {
		throw new ApiError(404, "Project not found in database.")
	}

	const user = await User.findOne({ email: email })
	const userId = user?._id

	if (!user) {
		throw new ApiError(404, "User not found in database.")
	}

	// ✅ Use constants instead of hardcoded strings
	if (!AvailableProjectRole.includes(role)) {
		throw new ApiError(400, `Role must be one of: ${AvailableProjectRole.join(", ")}`)
	}

	// ✅ Prevent assigning global ADMIN role at project level
	if (role === UserRoleEnum.ADMIN) {
		throw new ApiError(400, "Cannot assign global admin role at the project level.")
	}

	const existingMember = await ProjectMember.findOne({
		isActive: true,
		project: projectId,
		user: userId,
	})

	if (existingMember) {
		throw new ApiError(400, "User is already a member of this project.")
	}

	const projectMember = await ProjectMember.create({
		project: projectId,
		role: role || ProjectRoleEnum.MEMBER,
		user: userId,
	})

	if (!projectMember) {
		throw new ApiError(500, "Something went wrong while adding member to project.")
	}

	res.status(201).json(new ApiResponse(201, projectMember, "Member added"))
	next()
})

export const updateMember = asyncHandler(async (req, res, next) => {
	const { projectId } = req.params
	const { userId, role } = req.body

	if (!projectId) {
		throw new ApiError(401, "Project Id not found from params")
	}
	if (!userId) {
		throw new ApiError(400, "User ID is required.")
	}
	if (!role) {
		throw new ApiError(400, "Role is required.")
	}

	const project = await Project.findById(projectId)
	if (!project) {
		throw new ApiError(404, "Project not found in database.")
	}

	const user = await User.findById(userId)
	if (!user) {
		throw new ApiError(404, "User not found in database.")
	}

	// ✅ Use constants instead of hardcoded strings
	if (!AvailableProjectRole.includes(role)) {
		throw new ApiError(400, `Role must be one of: ${AvailableProjectRole.join(", ")}`)
	}

	// ✅ Prevent assigning global ADMIN role at project level
	if (role === UserRoleEnum.ADMIN) {
		throw new ApiError(400, "Cannot assign global admin role at the project level.")
	}

	const updatedMember = await ProjectMember.findOneAndUpdate(
		{ project: projectId, user: userId },
		{ role: role },
		{ new: true },
	)

	if (!updatedMember) {
		throw new ApiError(500, "Something went wrong while updating member in project.")
	}

	res.status(200).json(new ApiResponse(200, updatedMember, "Member updated"))
	next()
})

export const removeMember = asyncHandler(async (req, res, next) => {
	const { projectId, memberId } = req.params
	const { transferRoleTo } = req.body

	if (!projectId) {
		throw new ApiError(401, "Project Id not found from params")
	}

	const project = await Project.findById(projectId)
	if (!project) {
		throw new ApiError(404, "Project not found in database.")
	}

	const member = await ProjectMember.findById(memberId)
	if (!member) {
		throw new ApiError(404, "Project member not found.")
	}

	// ✅ If removing PROJECT_ADMIN or OWNER, ensure there's another admin
	if (member.role === ProjectRoleEnum.PROJECT_ADMIN || member.role === ProjectRoleEnum.OWNER) {
		const adminCount = await ProjectMember.countDocuments({
			isActive: true,
			project: projectId,
			role: { $in: [ProjectRoleEnum.OWNER, ProjectRoleEnum.PROJECT_ADMIN] },
		})

		if (adminCount <= 1 && !transferRoleTo) {
			throw new ApiError(
				400,
				"Cannot remove last admin/owner. Transfer admin rights first or specify transferRoleTo.",
			)
		}

		// Transfer admin rights if specified
		if (transferRoleTo) {
			await ProjectMember.findOneAndUpdate(
				{ project: projectId, user: transferRoleTo },
				{ role: ProjectRoleEnum.PROJECT_ADMIN },
			)
		}
	}

	// ✅ Soft delete instead of hard delete
	member.isActive = false
	member.deactivatedAt = new Date()
	member.deactivatedBy = req.user._id
	await member.save()

	res.status(200).json(new ApiResponse(200, null, "Member removed successfully"))
	next()
})

export const getAllMembers = asyncHandler(async (req, res, next) => {
	const { projectId } = req.params

	const members = await ProjectMember.find({
		isActive: true,
		project: projectId,
	}).populate("user", "email fullname avatar")

	if (!members || members.length === 0) {
		return res.status(200).json(new ApiResponse(200, [], "No members found for this project."))
	}

	res.status(200).json(new ApiResponse(200, members, "Project members retrieved"))
	next()
})

export const projectMemberController = {
	addMember,
	getAllMembers,
	removeMember,
	updateMember,
}
