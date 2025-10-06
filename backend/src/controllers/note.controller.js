import { ProjectNote } from "../models/note.model.js";
import ApiError from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.model.js";
import mongoose from "mongoose";

const createNotes = asyncHandler(async (req, res, next) => {
  // Validate project ID and user authentication
  // Check if projectId is provided and valid
  // Check if user is authenticated
  // Check if project exists
  // Check if content is provided
  // Create a new note with the provided content
  // Return the created note in the response
  // Handle errors

  const { projectId } = req.params;
  if (!projectId || !mongoose.isValidObjectId(projectId)) {
    throw new ApiError(401, "provide valid project id");
  }
  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found create project first");
  }
  const { content } = req.body;
  if (!content) {
    throw new ApiError(401, "provide notes");
  }
  const note = await ProjectNote.create({
    project,
    createdBy: req.user._id,
    content,
  });
  if (!note) {
    throw new ApiError(401, "note is not created");
  }
  res.status(201).json(new ApiResponse(201, note, "Note is created successfully"));
  next();
});
const getNotes = asyncHandler(async (req, res, next) => {
  // Validate project ID and user authentication

  // Check if projectId is provided and valid
  // Check if user is member of the project

  // Fetch all notes for the specified project
  // Return the notes in the response
  // Handle errors

  const { projectId } = req.params;
  if (!projectId || !mongoose.isValidObjectId(projectId)) {
    throw new ApiError(401, "provide valid project id");
  }
  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found create project first");
  }
  const notes = await ProjectNote.find({ project }).populate("createdBy", "name");
  res.status(200).json(new ApiResponse(200, notes, "Notes fetched successfully"));
  next();
});

const getNoteById = asyncHandler(async (req, res, next) => {
  const { noteId } = req.params;

  if (!noteId || !mongoose.isValidObjectId(noteId)) {
    throw new ApiError(401, "provide valid note id");
  }
  const note = await ProjectNote.findById(noteId).populate(
    "createdBy",
    "name fullname email avatar"
  );
  if (!note) {
    throw new ApiError(404, "Note not found");
  }
  res.status(200).json(new ApiResponse(200, note, "Note fetched successfully"));
  next();
});

const updateNote = asyncHandler(async (req, res, next) => {
  const { projectId, noteId } = req.params;
  if (!projectId || !mongoose.isValidObjectId(projectId)) {
    throw new ApiError(401, "project is not found");
  }
  if (!noteId || !mongoose.isValidObjectId(noteId)) {
    throw new ApiError(401, "note is not found");
  }
  const { content } = req.body;
  const userID = req.user._id;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found create project first");
  }

  const note = await ProjectNote.findByIdAndUpdate(
    noteId,
    { content, updatedBy: userID },
    { new: true }
  );

  if (!note) {
    throw new ApiError("402", "something went wrong while updating the note.");
  }
  res.status(202).json(new ApiResponse(202, note, "Note updated successfully"));
  next();
});

const deleteNote = asyncHandler(async (req, res, next) => {
  const { projectId, noteId } = req.params;
  if (!projectId || !mongoose.isValidObjectId(projectId)) {
    throw new ApiError(401, "projectID is not found in project");
  }
  if (!noteId || !mongoose.isValidObjectId(noteId)) {
    throw new ApiError(401, "note is not found");
  }
  const project = await Project.findOne({ _id: projectId });
  if (!project) {
    throw new ApiError(404, "Project not found", [], "Project not found", false);
  }
  const deleteNote = await ProjectNote.findOneAndDelete(noteId);
  if (!deleteNote) {
    throw new ApiError(402, "Something went wrong while deleting the note.", [], "", false);
  }
  res.status(203).json(new ApiResponse(203, deleteNote, "Note deleted successfully"));
  next();
});
export { createNotes, getNotes, getNoteById, updateNote, deleteNote };
