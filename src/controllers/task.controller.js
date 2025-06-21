import { Task } from "../models/task.model.js";
import { asyncHandler } from "../utils/async-handler.js";

const createTask = asyncHandler(async (req, res, next) => {
  const { title, description, assignedTo, assignedBy, project } = req.body;
  console.log(req.user._id);
  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: "Name and description are required",
    });
  }
  const task = new Task({
    title,
    description,
    assignedBy: req.user._id, // Assuming req.user is set by authentication middleware
    assignedTo,
  });

  await task.save();
  res.status(201).json({
    success: true,
    message: "Task created successfully",
    task,
  });
  next();
});
export { createTask };
