import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { Project } from "../models/project.model.js";
import ApiError from "../utils/api-error.js";

// Create a project
const createProject = asyncHandler(async (req, res, next) => {
  const { name, description, createdBy } = req.body;
  const project = new Project({ name, description, createdBy });
  await project.save();

  res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});

// Read a project by ID
const getProjectById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const project = await Project.findById(id);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
});

// Update a project
const updateProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const project = await Project.findByIdAndUpdate(
    id,
    { name, description },
    { new: true }
  );
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

// Delete a project
const deleteProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const project = await Project.findByIdAndDelete(id);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, project, "Project deleted successfully"));
});

export { createProject, getProjectById, updateProject, deleteProject };
