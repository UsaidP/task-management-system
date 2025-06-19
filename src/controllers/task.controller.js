import { Task } from "../models/task.model.js";
import { asyncHandler } from "../utils/async-handler.js";

const createTask = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({
      success: false,
      message: "Name and description are required",
    });
  }
  const task = new Task({
    name,
    description,
    user: req.user._id, // Assuming req.user is set by authentication middleware
  });

  await task.save();
  return res.status(201).json({
    success: true,
    message: "Task created successfully",
    task,
  });
});
export { createTask };
