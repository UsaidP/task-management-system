import { Task } from "../models/task.model";

const createTask = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;
  const task = await Task.create({
    title,
    description,
    createdBy: req.user._id,
  });
  if (!task) {
    throw new ApiError(400, "Task creation failed");
  }
  // await task.save();

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});
