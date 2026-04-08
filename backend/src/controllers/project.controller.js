import { Project } from "../models/project.model.js"
import { ProjectMember } from "../models/projectmember.model.js"
import ApiError from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import { logAudit } from "../utils/audit-log.js"
import { ProjectRoleEnum } from "../utils/constants.js"

const validateProjectData = (name, description) => {
	if (!name || name.trim().length === 0) {
		throw new ApiError(400, "Project Name is required")
	}
	if (!description || description.trim().length === 0) {
		throw new ApiError(400, "Project Description is required")
	}
	if (description && description.trim().length > 500) {
		throw new ApiError(400, "Project Description is too long, max 500 characters allowed")
	}
}

// Create a project
const createProject = asyncHandler(async (req, res, next) => {
	const { name, description } = req.body
	validateProjectData(name, description)

	// Check if project with the same name already exists
	const existingProject = await Project.findOne({
		createdBy: req.user._id,
		name: name.trim(),
	})
	if (existingProject) {
		throw new ApiError(
			409,
			"You already have a project with this name. Please choose a different name.",
		)
	}

	const project = await Project.create({
		createdBy: req.user._id,
		description: description?.trim() || "",
		name: name.trim(),
	})

	if (!project) {
		throw new ApiError(400, "Project creation failed")
	}

	// ✅ Creator gets OWNER role (not ADMIN - that's for global admin)
	const projectMember = await ProjectMember.create({
		project: project._id,
		role: ProjectRoleEnum.OWNER,
		user: req.user._id,
	})

	if (!projectMember) {
		throw new ApiError(400, "Failed to add creator as project owner")
	}

	// Audit log
	await logAudit({
		actor: req.user,
		category: "project",
		description: `Project "${project.name}" created`,
		event: "project.create",
		ipAddress: req.ip,
		targetId: project._id,
		userAgent: req.headers["user-agent"],
	})

	res
		.status(201)
		.json(new ApiResponse(201, { project, projectMember }, "Project created successfully"))
	next()
})

const getAllProjects = asyncHandler(async (req, res, next) => {
	const { page = 1, limit = 20, search = "" } = req.query
	const userId = req.user._id

	// Cap pagination values to prevent memory exhaustion
	const pageNum = Math.max(1, Math.min(parseInt(page, 10), 100))
	const limitNum = Math.max(1, Math.min(parseInt(limit, 10), 50))

	// Find all ACTIVE project memberships for the user and populate project details
	const projectMemberships = await ProjectMember.find({
		isActive: true,
		user: userId,
	}).populate("project")

	// Filter out any null projects (in case of data inconsistency) and get valid projects
	const projects = projectMemberships.map((pm) => pm.project).filter((project) => project !== null)

	// Build query
	const query = { _id: { $in: projects.map((p) => p._id) } }
	if (search) {
		// Escape regex special characters to prevent ReDoS attacks
		const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
		query.$or = [
			{ name: { $options: "i", $regex: escapedSearch } },
			{ description: { $options: "i", $regex: escapedSearch } },
		]
	}

	// Execute paginated query
	const paginatedProjects = await Project.find(query)
		.sort({ createdAt: -1 })
		.limit(limitNum)
		.skip((pageNum - 1) * limitNum)
		.select("-__v")

	const totalProjects = await Project.countDocuments(query)

	res.status(200).json(
		new ApiResponse(
			200,
			{
				pagination: {
					currentPage: pageNum,
					hasNextPage: pageNum < Math.ceil(totalProjects / limitNum),
					hasPrevPage: pageNum > 1,
					totalPages: Math.ceil(totalProjects / limitNum),
					totalProjects,
				},
				projects: paginatedProjects,
			},
			"Projects fetched successfully",
		),
	)
	next()
})

// Read a project by ID
const getProjectById = asyncHandler(async (req, res, next) => {
	const { projectId: id } = req.params
	const project = await Project.findById(id)
	if (!project) {
		throw new ApiError(404, "Project not found")
	}
	res.status(200).json(new ApiResponse(200, project, "Project fetched successfully"))
	next()
})

// Update a project
const updateProject = asyncHandler(async (req, res, next) => {
	const { projectId: id } = req.params
	const { name, description, isActive } = req.body
	if (!id) {
		throw new ApiError(400, "Create a project first, then update it")
	}
	if (!name || !description) {
		throw new ApiError(400, "Project name and description are required")
	}

	const updateData = { description: description?.trim(), name: name.trim() }
	if (typeof isActive === "boolean") {
		updateData.isActive = isActive
	}

	const project = await Project.findByIdAndUpdate(id, updateData, { new: true })
	if (!project) {
		throw new ApiError(404, "Project not found")
	}
	res.status(200).json(new ApiResponse(200, project, "Project updated successfully"))
	next()
})

// Delete a project
const deleteProject = asyncHandler(async (req, res, next) => {
	const { projectId: id } = req.params
	const project = await Project.findByIdAndDelete(id)
	if (!project) {
		throw new ApiError(404, "Project not found")
	}

	// Audit log
	await logAudit({
		actor: req.user,
		category: "project",
		description: `Project "${project.name}" deleted`,
		event: "project.delete",
		ipAddress: req.ip,
		targetId: project._id,
		userAgent: req.headers["user-agent"],
	})

	res.status(200).json(new ApiResponse(200, project, "Project deleted successfully"))
	next()
})

export { createProject, getProjectById, updateProject, deleteProject, getAllProjects }
