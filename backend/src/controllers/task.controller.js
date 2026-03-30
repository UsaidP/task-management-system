import mongoose, { Mongoose } from "mongoose"
import { Project } from "../models/project.model.js"
import { ProjectNote } from "../models/projectnote.model.js"
import { SubTask } from "../models/subtask.model.js"
import { Task } from "../models/task.model.js"
import ApiError from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import imagekit from "../utils/imagekit.js"

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
		labels,
		note,
	} = req.body
	const { projectId, noteId } = req.params
	const userID = req.user._id

	if (!title) {
		return res.status(400).json({
			message: "Title is required",
			success: false,
		})
	}

	if (!projectId) {
		return res.status(400).json({
			message: "Project ID is required",
			success: false,
		})
	}

	if (!userID) {
		return res.status(401).json({
			message: "Login to create task",
			success: false,
		})
	}

	const project = await Project.findById(projectId)
	if (!project) {
		return res.status(404).json({
			message: "Project not found",
			success: false,
		})
	}

	const taskData = {
		assignedBy: new mongoose.Types.ObjectId(userID),
		assignedTo,
		attachments,
		comments,
		createdBy: new mongoose.Types.ObjectId(userID),
		description,
		dueDate,
		labels,
		priority,
		project: projectId,
		startDate,
		status,
		title,
	}
	if (noteId) {
		const note = await ProjectNote.findById(noteId)
		if (!note) {
			throw new ApiError(404, "Note not found")
		}
		taskData.note = noteId // Assuming Task model has a "note field"
	}

	let createdSubtasks = []
	if (subtasks && subtasks.length > 0) {
		const subtaskDocs = subtasks.map((sub) => ({
			createdBy: userID,
			project: projectId,
			task: null, // Will be set after task is created
			title: sub.title,
		}))
		createdSubtasks = await SubTask.insertMany(subtaskDocs)
		taskData.subtasks = createdSubtasks.map((sub) => sub._id)
	}

	const task = await Task.create(taskData)

	if (!task) {
		throw new ApiError(400, "Task creation failed")
	}

	// Update the task field for each created subtask
	if (createdSubtasks.length > 0) {
		await Promise.all(
			createdSubtasks.map((sub) => {
				sub.task = task._id
				return sub.save()
			}),
		)
	}

	// Populate subtasks before sending the response
	const populatedTask = await Task.findById(task._id).populate("subtasks")

	return res.status(201).json({
		message: "Task created successfully",
		success: true,
		task: populatedTask,
	})
})

const getTasks = asyncHandler(async (req, res, next) => {
	const { projectId } = req.params

	if (!projectId) {
		return res.status(400).json({
			message: "Project ID is required",
			success: false,
		})
	}

	const tasks = await Task.find({ project: projectId }).populate("assignedTo", "name email")
	console.log(`tasks: ${tasks}`)
	if (!tasks) {
		throw new ApiError(404, "Tasks not found")
	}

	return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully"))
})

const getAllTasks = asyncHandler(async (req, res, next) => {
	const userID = String(req.user._id)
	console.log(`userID: ${userID}`)
	if (!userID) {
		throw new ApiError(401, "Login to view tasks")
	}

	const tasks = await Task.find({ assignedTo: userID }).populate("assignedTo", "name email")
	console.log(`tasks: ${JSON.stringify(tasks)}`)
	if (!tasks && tasks.length === 0) {
		throw new ApiError(404, "Tasks not found")
	}
	return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully"))
})
const getTaskById = asyncHandler(async (req, res, next) => {
	const { taskId } = req.params
	if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
		throw new ApiError(400, "Invalid task ID")
	}
	const task = await Task.findById(taskId).populate("assignedTo", "name email")
	if (!task) {
		throw new ApiError(404, "Task not found")
	}
	return res.status(200).json(new ApiResponse(200, task, "Task fetched successfully"))
})

const updateTask = asyncHandler(async (req, res, next) => {
	const { taskId } = req.params
	const {
		title,
		description,
		assignedTo,
		status,
		priority,
		dueDate,
		comments,
		labels,
		attachments,
	} = req.body
	if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
		throw new ApiError(400, "Invalid task ID")
	}

	const updatedFields = {
		...(title !== undefined && { title }),
		...(description !== undefined && { description }),
		...(assignedTo !== undefined && { assignedTo }),
		...(status !== undefined && { status }),
		...(priority !== undefined && { priority }),
		...(dueDate !== undefined && { dueDate }),
		...(comments !== undefined && { comments }),
		...(labels !== undefined && { labels }),
		...(attachments !== undefined && { attachments }),
	}

	if (Object.keys(updatedFields).length === 0) {
		throw new ApiError(400, "No fields to update")
	}

	const task = await Task.findByIdAndUpdate(taskId, { $set: updatedFields }, { new: true })

	if (!task) {
		throw new ApiError(404, "Task not found")
	}
	return res.status(200).json(new ApiResponse(200, task, "Task updated successfully"))
})

const deleteTask = asyncHandler(async (req, res, next) => {
	const { taskId, projectId } = req.params
	if (
		!taskId ||
		!mongoose.Types.ObjectId.isValid(taskId) ||
		!projectId ||
		!mongoose.Types.ObjectId.isValid(projectId)
	) {
		throw new ApiError(400, "Invalid task or project ID")
	}

	const task = await Task.findByIdAndDelete(taskId)

	if (!task) {
		throw new ApiError(404, "Task not found")
	}

	// Also remove the task from the project's tasks array
	await Project.findByIdAndUpdate(projectId, {
		$pull: { tasks: taskId },
	})

	return res.status(200).json(new ApiResponse(200, null, "Task deleted successfully"))
})

const deleteComment = asyncHandler(async (req, res, next) => {
	const { taskId, commentId } = req.params
	const userId = req.user._id

	if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
		throw new ApiError(400, "Invalid task ID")
	}

	if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
		throw new ApiError(400, "Invalid comment ID")
	}

	const task = await Task.findById(taskId)
	if (!task) {
		throw new ApiError(404, "Task not found")
	}

	// Find the comment and verify ownership
	const comment = task.comments.id(commentId)
	if (!comment) {
		throw new ApiError(404, "Comment not found")
	}

	// Check if user owns the comment
	if (comment.user.toString() !== userId.toString()) {
		throw new ApiError(403, "You can only delete your own comments")
	}

	// Remove the comment
	task.comments.pull(commentId)
	await task.save()

	return res.status(200).json(new ApiResponse(200, task, "Comment deleted successfully"))
})

const uploadAttachment = asyncHandler(async (req, res, next) => {
	const { projectId, taskId } = req.params

	if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
		throw new ApiError(400, "Invalid task ID")
	}

	if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
		throw new ApiError(400, "Invalid project ID")
	}

	const task = await Task.findById(taskId)
	if (!task) {
		throw new ApiError(404, "Task not found")
	}

	if (!req.file) {
		throw new ApiError(400, "No file uploaded")
	}

	// Upload to ImageKit
	const uploadResult = await imagekit.upload({
		file: req.file.path,
		fileName: req.file.originalname,
	})

	if (!uploadResult) {
		throw new ApiError(500, "Failed to upload file")
	}

	// Add to attachments array
	const newAttachment = {
		filename: req.file.originalname,
		url: uploadResult.url,
	}

	task.attachments.push(newAttachment)
	await task.save()

	return res.status(200).json(new ApiResponse(200, newAttachment, "File uploaded successfully"))
})

const deleteAttachment = asyncHandler(async (req, res, next) => {
	const { taskId, attachmentIndex } = req.params

	if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
		throw new ApiError(400, "Invalid task ID")
	}

	if (attachmentIndex === undefined || isNaN(parseInt(attachmentIndex))) {
		throw new ApiError(400, "Invalid attachment index")
	}

	const task = await Task.findById(taskId)
	if (!task) {
		throw new ApiError(404, "Task not found")
	}

	const index = parseInt(attachmentIndex)
	if (index < 0 || index >= task.attachments.length) {
		throw new ApiError(404, "Attachment not found")
	}

	task.attachments.splice(index, 1)
	await task.save()

	return res.status(200).json(new ApiResponse(200, null, "Attachment deleted successfully"))
})

export {
	createTask,
	getTasks,
	getTaskById,
	updateTask,
	deleteTask,
	getAllTasks,
	deleteComment,
	uploadAttachment,
	deleteAttachment,
}
