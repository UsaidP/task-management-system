import mongoose from "mongoose"
import { SubTask } from "../models/subtask.model.js"
import { Task } from "../models/task.model.js"
import ApiError from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"

const createSubTask = asyncHandler(async (req, res) => {
	const { taskId } = req.params
	const { title } = req.body

	if (!mongoose.isValidObjectId(taskId)) {
		throw new ApiError(400, "Invalid Task ID")
	}

	if (!title) {
		throw new ApiError(400, "Subtask title is required")
	}

	const task = await Task.findById(taskId)
	if (!task) {
		throw new ApiError(404, "Task not found")
	}

	const subtask = await SubTask.create({
		createdBy: req.user._id,
		task: taskId,
		title,
	})

	return res.status(201).json(new ApiResponse(201, subtask, "Subtask created successfully"))
})

const getSubTasksForTask = asyncHandler(async (req, res) => {
	const { taskId } = req.params

	if (!mongoose.isValidObjectId(taskId)) {
		throw new ApiError(400, "Invalid Task ID")
	}

	const subtasks = await SubTask.find({ task: taskId })

	return res.status(200).json(new ApiResponse(200, subtasks, "Subtasks fetched successfully"))
})

const getSubTaskById = asyncHandler(async (req, res) => {
	const { subtaskId } = req.params

	if (!mongoose.isValidObjectId(subtaskId)) {
		throw new ApiError(400, "Invalid Subtask ID")
	}

	const subtask = await SubTask.findById(subtaskId)
	if (!subtask) {
		throw new ApiError(404, "Subtask not found")
	}

	return res.status(200).json(new ApiResponse(200, subtask, "Subtask fetched successfully"))
})

const updateSubTask = asyncHandler(async (req, res) => {
	const { subtaskId } = req.params
	const updateData = {}

	if (!mongoose.isValidObjectId(subtaskId)) {
		throw new ApiError(400, "Invalid Subtask ID")
	}

	// Only update fields that are provided in the request body
	if (req.body.title !== undefined) {
		updateData.title = req.body.title
	}
	if (req.body.isCompleted !== undefined) {
		updateData.isCompleted = req.body.isCompleted

		// If marking as completed, set completedAt timestamp
		if (req.body.isCompleted === true) {
			updateData.completedAt = new Date()
		} else if (req.body.isCompleted === false) {
			updateData.completedAt = null
		}
	}

	// Check if there's anything to update
	if (Object.keys(updateData).length === 0) {
		throw new ApiError(400, "No valid fields to update")
	}

	const subtask = await SubTask.findByIdAndUpdate(subtaskId, updateData, {
		new: true,
		runValidators: true,
	})

	if (!subtask) {
		throw new ApiError(404, "Subtask not found")
	}

	return res.status(200).json(new ApiResponse(200, subtask, "Subtask updated successfully"))
})

const deleteSubTask = asyncHandler(async (req, res) => {
	const { subtaskId } = req.params

	if (!mongoose.isValidObjectId(subtaskId)) {
		throw new ApiError(400, "Invalid Subtask ID")
	}

	const subtask = await SubTask.findByIdAndDelete(subtaskId)
	if (!subtask) {
		throw new ApiError(404, "Subtask not found")
	}

	return res.status(200).json(new ApiResponse(200, {}, "Subtask deleted successfully"))
})

export { createSubTask, getSubTasksForTask, getSubTaskById, updateSubTask, deleteSubTask }
