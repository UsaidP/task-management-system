import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.model.js";
import { ProjectNote } from "../models/note.model.js";
import ApiError from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const createTask = asyncHandler(async (req, res, next) => {
  const { title, description, assignedTo, status, attachments } = req.body;
  const { projectId, noteId } = req.params;
  const userID = req.user._id;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: "Title and description are required",
    });
  }

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: "Project ID is required",
    });
  }

  if (!userID) {
    return res.status(401).json({
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

  const taskData = {
    title,
    description,
    project: projectId,
    assignedBy: new mongoose.Types.ObjectId(userID),
    assignedTo,
    status,
    attachments,
  };

  if (noteId) {
    const note = await ProjectNote.findById(noteId);
    if (!note) {
      throw new ApiError(404, "Note not found");
    }
    taskData.note = noteId; // Assuming Task model has a 'note' field
  }

  const task = await Task.create(taskData);
  if (!task) {
    throw new ApiError(400, "Task creation failed");
  }

  return res.status(201).json({
    success: true,
    message: "Task created successfully",
    task,
  });
});

const getTasks = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: "Project ID is required",
    });
  }

  const tasks = await Task.find({ project: projectId }).populate("assignedTo", "name email");

  return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

const getTaskById = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task ID");
  }
  const task = await Task.findById(taskId).populate("assignedTo", "name email");
  if (!task) {
    throw new ApiError(404, "Task not found");
  }
  return res.status(200).json(new ApiResponse(200, task, "Task fetched successfully"));
});

const updateTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const { title, description, assignedTo, status, attachments } = req.body;
  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task ID");
  }
  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }
  if (!assignedTo || !Array.isArray(assignedTo)) {
    throw new ApiError(400, "AssignedTo must be an array of user IDs");
  }

  const task = await Task.findByIdAndUpdate(
    taskId,
    { title, description, assignedTo, status, attachments },
    { new: true }
  );
  if (!task) {
    throw new ApiError(404, "Task not found");
  }
  return res.status(200).json(new ApiResponse(200, task, "Task updated successfully"));
});

const deleteTask = asyncHandler(async (req, res, next) => {
  const { taskId, projectId } = req.params;
  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task ID");
  }
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID");
  }
  const project = await Task.findOne({ project: projectId });
  if (!project) {
    throw new ApiError(404, "Project not found for this task");
  }

  const task = await Task.findByIdAndDelete(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }
  return res.status(200).json(new ApiResponse(200, null, "Task deleted successfully"));
});

export { createTask, getTasks, getTaskById, updateTask, deleteTask };
