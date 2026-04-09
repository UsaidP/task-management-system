import mongoose from "mongoose"
import { Project } from "../models/project.model.js"
import { ProjectNote } from "../models/projectnote.model.js"
import ApiError from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"

const createNotes = asyncHandler(async (req, res) => {
	const { projectId } = req.params
	if (!projectId || !mongoose.isValidObjectId(projectId)) {
		throw new ApiError(400, "Provide valid project id")
	}

	const project = await Project.findById(projectId)
	if (!project) {
		throw new ApiError(404, "Project not found")
	}

	const { content, title } = req.body
	if (!content) {
		throw new ApiError(400, "Content is required")
	}

	const note = await ProjectNote.create({
		content,
		createdBy: req.user._id,
		project: project._id,
		title: title || "Untitled Note",
	})

	if (!note) {
		throw new ApiError(500, "Failed to create note")
	}

	const populatedNote = await ProjectNote.findById(note._id).populate(
		"createdBy",
		"fullname email avatar username",
	)

	res.status(201).json(new ApiResponse(201, populatedNote, "Note created successfully"))
})
const getNotes = asyncHandler(async (req, res) => {
	const { projectId } = req.params
	if (!projectId || !mongoose.isValidObjectId(projectId)) {
		throw new ApiError(400, "Provide valid project id")
	}

	const project = await Project.findById(projectId)
	if (!project) {
		throw new ApiError(404, "Project not found")
	}

	const notes = await ProjectNote.find({ project: project._id }).populate(
		"createdBy",
		"fullname email avatar username",
	)

	res.status(200).json(new ApiResponse(200, notes || [], "Notes fetched successfully"))
})

const getNoteById = asyncHandler(async (req, res) => {
	const { noteId } = req.params

	if (!noteId || !mongoose.isValidObjectId(noteId)) {
		throw new ApiError(400, "Provide valid note id")
	}

	const note = await ProjectNote.findById(noteId).populate(
		"createdBy",
		"fullname email avatar username",
	)
	if (!note) {
		throw new ApiError(404, "Note not found")
	}

	res.status(200).json(new ApiResponse(200, note, "Note fetched successfully"))
})

const updateNote = asyncHandler(async (req, res) => {
	const { projectId, noteId } = req.params
	if (!projectId || !mongoose.isValidObjectId(projectId)) {
		throw new ApiError(400, "Invalid project ID")
	}
	if (!noteId || !mongoose.isValidObjectId(noteId)) {
		throw new ApiError(400, "Invalid note ID")
	}

	const { content } = req.body

	const note = await ProjectNote.findByIdAndUpdate(
		noteId,
		{ content, lastEditedBy: req.user._id },
		{ new: true, runValidators: true },
	)

	if (!note) {
		throw new ApiError(404, "Note not found")
	}

	res.status(200).json(new ApiResponse(200, note, "Note updated successfully"))
})

const deleteNote = asyncHandler(async (req, res) => {
	const { projectId, noteId } = req.params
	if (!projectId || !mongoose.isValidObjectId(projectId)) {
		throw new ApiError(400, "Invalid project ID")
	}
	if (!noteId || !mongoose.isValidObjectId(noteId)) {
		throw new ApiError(400, "Invalid note ID")
	}

	const project = await Project.findById(projectId)
	if (!project) {
		throw new ApiError(404, "Project not found")
	}

	const deletedNote = await ProjectNote.findByIdAndDelete(noteId)
	if (!deletedNote) {
		throw new ApiError(404, "Note not found")
	}

	res.status(200).json(new ApiResponse(200, deletedNote, "Note deleted successfully"))
})
export { createNotes, getNotes, getNoteById, updateNote, deleteNote }
