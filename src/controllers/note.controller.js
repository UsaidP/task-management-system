import { ProjectNote } from "../models/note.model.js";
import ApiError from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.model.js";

const createNotes = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  if (!projectId) {
    throw new ApiError(401, "provide project id");
  }
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found create project first");
  }
  const { content } = req.body;
  if (!content) {
    throw new ApiError(401, "provide notes");
  }
  const note = await ProjectNote.create({ content });
  if (!note) {
    throw new ApiError(401, "note is not created");
  }
  res
    .status(201)
    .json(new ApiResponse(201, note, "Note is created successfully"));
  next();
});
const getNotes = asyncHandler(async (req, res, next) => {
  console.log("Here");
});
export { createNotes, getNotes };
