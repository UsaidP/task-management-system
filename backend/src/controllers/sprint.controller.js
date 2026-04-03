import mongoose from "mongoose"
import { Sprint } from "../models/sprint.model.js"
import { Task } from "../models/task.model.js"
import ApiError from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"

const createSprint = asyncHandler(async (req, res) => {
  const { name, goal, startDate, endDate, projectId } = req.body

  if (!name || !startDate || !endDate || !projectId) {
    throw new ApiError(400, "Name, start date, end date and project are required")
  }

  const sprint = await Sprint.create({
    endDate: new Date(endDate),
    goal,
    name,
    project: projectId,
    startDate: new Date(startDate),
    status: "backlog",
  })

  return res.status(201).json(new ApiResponse(201, sprint, "Sprint created successfully"))
})

const getSprints = asyncHandler(async (req, res) => {
  const { projectId } = req.params

  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID")
  }

  const sprints = await Sprint.find({ project: projectId }).sort({ createdAt: -1 })

  return res.status(200).json(new ApiResponse(200, sprints, "Sprints fetched successfully"))
})

const getSprintById = asyncHandler(async (req, res) => {
  const { sprintId } = req.params

  if (!sprintId || !mongoose.Types.ObjectId.isValid(sprintId)) {
    throw new ApiError(400, "Invalid sprint ID")
  }

  const sprint = await Sprint.findById(sprintId)
  if (!sprint) {
    throw new ApiError(404, "Sprint not found")
  }

  return res.status(200).json(new ApiResponse(200, sprint, "Sprint fetched successfully"))
})

const updateSprint = asyncHandler(async (req, res) => {
  const { sprintId } = req.params
  const { name, goal, startDate, endDate, status } = req.body

  if (!sprintId || !mongoose.Types.ObjectId.isValid(sprintId)) {
    throw new ApiError(400, "Invalid sprint ID")
  }

  const updateFields = {}
  if (name) updateFields.name = name
  if (goal) updateFields.goal = goal
  if (startDate) updateFields.startDate = new Date(startDate)
  if (endDate) updateFields.endDate = new Date(endDate)
  if (status) updateFields.status = status

  const sprint = await Sprint.findByIdAndUpdate(sprintId, { $set: updateFields }, { new: true })

  if (!sprint) {
    throw new ApiError(404, "Sprint not found")
  }

  return res.status(200).json(new ApiResponse(200, sprint, "Sprint updated successfully"))
})

const deleteSprint = asyncHandler(async (req, res) => {
  const { sprintId } = req.params

  if (!sprintId || !mongoose.Types.ObjectId.isValid(sprintId)) {
    throw new ApiError(400, "Invalid sprint ID")
  }

  const sprint = await Sprint.findByIdAndDelete(sprintId)

  if (!sprint) {
    throw new ApiError(404, "Sprint not found")
  }

  // Unassign all tasks from this sprint
  await Task.updateMany({ sprint: sprintId }, { $unset: { sprint: 1 } })

  return res.status(200).json(new ApiResponse(200, null, "Sprint deleted successfully"))
})

const startSprint = asyncHandler(async (req, res) => {
  const { sprintId } = req.params
  const { projectId } = req.body

  if (!sprintId || !mongoose.Types.ObjectId.isValid(sprintId)) {
    throw new ApiError(400, "Invalid sprint ID")
  }

  // First, deactivate any other active sprints for this project
  await Sprint.updateMany(
    { project: projectId, status: "active" },
    { $set: { status: "completed" } },
  )

  // Then activate this sprint
  const sprint = await Sprint.findByIdAndUpdate(
    sprintId,
    { $set: { status: "active" } },
    { new: true },
  )

  if (!sprint) {
    throw new ApiError(404, "Sprint not found")
  }

  return res.status(200).json(new ApiResponse(200, sprint, "Sprint started successfully"))
})

const completeSprint = asyncHandler(async (req, res) => {
  const { sprintId } = req.params
  const { moveTasksTo } = req.body // "next" or "backlog"

  if (!sprintId || !mongoose.Types.ObjectId.isValid(sprintId)) {
    throw new ApiError(400, "Invalid sprint ID")
  }

  const sprint = await Sprint.findById(sprintId)
  if (!sprint) {
    throw new ApiError(404, "Sprint not found")
  }

  // Get incomplete tasks (not in "completed" status)
  const _incompleteTasks = await Task.find({
    sprint: sprintId,
    status: { $ne: "completed" },
  })

  // Handle task movement based on moveTasksTo
  if (moveTasksTo === "backlog") {
    await Task.updateMany({ sprint: sprintId }, { $set: { status: "todo" }, $unset: { sprint: 1 } })
  } else if (moveTasksTo === "next") {
    // Find next sprint and move tasks there
    const nextSprint = await Sprint.findOne({
      _id: { $ne: sprintId },
      project: sprint.project,
      status: "backlog",
    }).sort({ startDate: 1 })

    if (nextSprint) {
      await Task.updateMany({ sprint: sprintId }, { $set: { sprint: nextSprint._id } })
    } else {
      // No next sprint, move to backlog
      await Task.updateMany(
        { sprint: sprintId },
        { $set: { status: "todo" }, $unset: { sprint: 1 } },
      )
    }
  }

  // Mark sprint as completed
  const updatedSprint = await Sprint.findByIdAndUpdate(
    sprintId,
    { $set: { status: "completed" } },
    { new: true },
  )

  return res.status(200).json(new ApiResponse(200, updatedSprint, "Sprint completed successfully"))
})

const assignTaskToSprint = asyncHandler(async (req, res) => {
  const { sprintId } = req.params
  const { taskId } = req.body

  if (!sprintId || !mongoose.Types.ObjectId.isValid(sprintId)) {
    throw new ApiError(400, "Invalid sprint ID")
  }
  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task ID")
  }

  const sprint = await Sprint.findById(sprintId)
  if (!sprint) {
    throw new ApiError(404, "Sprint not found")
  }

  const task = await Task.findByIdAndUpdate(taskId, { $set: { sprint: sprintId } }, { new: true })

  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  return res.status(200).json(new ApiResponse(200, task, "Task assigned to sprint"))
})

const removeTaskFromSprint = asyncHandler(async (req, res) => {
  const { taskId } = req.params

  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task ID")
  }

  const task = await Task.findByIdAndUpdate(taskId, { $unset: { sprint: 1 } }, { new: true })

  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  return res.status(200).json(new ApiResponse(200, task, "Task removed from sprint"))
})

const getBacklog = asyncHandler(async (req, res) => {
  const { projectId } = req.params

  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID")
  }

  // Get tasks not assigned to any sprint
  const tasks = await Task.find({
    project: projectId,
    sprint: { $exists: false },
  }).populate("assignedTo", "fullname email")

  return res.status(200).json(new ApiResponse(200, tasks, "Backlog fetched successfully"))
})

const getSprintVelocity = asyncHandler(async (req, res) => {
  const { projectId } = req.params

  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project ID")
  }

  const sprints = await Sprint.find({ project: projectId, status: "completed" })

  const velocityData = await Promise.all(
    sprints.map(async (sprint) => {
      const completedTasks = await Task.countDocuments({
        sprint: sprint._id,
        status: "completed",
      })
      return {
        endDate: sprint.endDate,
        sprintName: sprint.name,
        startDate: sprint.startDate,
        velocity: completedTasks,
      }
    }),
  )

  return res.status(200).json(new ApiResponse(200, velocityData, "Velocity data fetched"))
})

export {
  createSprint,
  getSprints,
  getSprintById,
  updateSprint,
  deleteSprint,
  startSprint,
  completeSprint,
  assignTaskToSprint,
  removeTaskFromSprint,
  getBacklog,
  getSprintVelocity,
}
