import mongoose from "mongoose";
import { Project } from "../models/project.model.js";
import { ProjectNote } from "../models/projectnote.model.js";
import { Task } from "../models/task.model.js";
import ApiError from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const createTask = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    createdBy,
    assignedTo,
    status,
    attachments,
    startDate,
    dueDate,
    priority,
    subtasks,
    comments,
  } = req.body;
  const { projectId, noteId } = req.params;
  const userID = req.user._id;

  console.log(`Task Form Data ${JSON.stringify(priority)}`);
  if (!title) {
    return res.status(400).json({
      message: "Title is required",
      success: false,
    });
  }

  if (!projectId) {
    return res.status(400).json({
      message: "Project ID is required",
      success: false,
    });
  }

  if (!userID) {
    return res.status(401).json({
      message: "Login to create task",
      success: false,
    });
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({
      message: "Project not found",
      success: false,
    });
  }

  const taskData = {
    assignedBy: new mongoose.Types.ObjectId(userID),
    assignedTo,
    attachments,
    createdBy: new mongoose.Types.ObjectId(userID),
    description,
    project: projectId,
    status,
    title,
    priority
  };
  console.log(`Here we go`);
  if (noteId) {
    const note = await ProjectNote.findById(noteId);
    if (!note) {
      throw new ApiError(404, "Note not found");
    }
    taskData.note = noteId; // Assuming Task model has a "note field"
  }

  const task = await Task.create(taskData);
  if (!task) {
    throw new ApiError(400, "Task creation failed");
  }

  return res.status(201).json({
    message: "Task created successfully",
    success: true,
    task,
  });
});

const getTasks = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({
      message: "Project ID is required",
      success: false,
    });
  }

  const tasks = await Task.find({ project: projectId }).populate(
    "assignedTo",
    "name email",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

const getAllTasks = asyncHandler(async (req, res, next) => {
  const userID = req.user._id;

  if (!userID) {
    return res.status(401).json({
      message: "Login to view tasks",
      success: false,
    });
  }

  const tasks = await Task.find({ assignedTo: userID }).populate(
    "assignedTo",
    "name email",
  );
  console.log(tasks.length);

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
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
  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task fetched successfully"));
});

const updateTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const updateData = req.body;
  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task ID");
  }

  const task = await Task.findByIdAndUpdate(
    taskId,
    { $set: updateData },
    { new: true },
  );
  if (!task) {
    throw new ApiError(404, "Task not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task updated successfully"));
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
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Task deleted successfully"));
});

export {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getAllTasks,
};
