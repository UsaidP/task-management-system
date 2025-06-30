import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.model.js";

const createTask = asyncHandler(async (req, res, next) => {
  const { title, description, assignedTo, assignedBy, status, attachments } = req.body;
  const { projectId, noteId } = req.params;
  const userID = req.user._id;
  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: "Name and description are required",
    });
  }

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: "Project ID is required",
    });
  }
  if (!noteId) {
    return res.status(400).json({
      success: false,
      message: "Note ID is required",
    });
  }

  if (!userID) {
    return res.status(400).json({
      success: false,
      message: "Login to create task",
    });
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
    });
  }

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignedBy: new mongoose.Types.ObjectId(userID), // Assuming req.user is set by authentication middleware
    assignedTo,
    status,
  });
  if (!task) {
    throw new ApiError(400, "Task creation failed");
  }

  if (noteId) {
    const note = await ProjectNote.findById(noteId);
    if (!note) {
      throw new ApiError(404, "Note not found");
    }
    note.tasks.push(task._id);
    await note.save();
  }

  return res.status(201).json({
    success: true,
    message: "Task created successfully",
    task,
  });
});
export { createTask };
