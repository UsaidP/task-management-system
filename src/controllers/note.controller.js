import { ProjectNote } from "../models/note.model.js";
import ApiError from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const createNotes = asyncHandler(async (req, res, next) => {
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
