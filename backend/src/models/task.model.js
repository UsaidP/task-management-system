import mongoose, { Schema } from "mongoose";

// A sub-schema for comments to keep collaboration organized within the task.
const commentSchema = new Schema(
  {
    content: { required: true, trim: true, type: String },
    user: { ref: "User", required: true, type: Schema.Types.ObjectId },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const taskSchema = new Schema(
  {
    // --- Assignment & Status ---
    assignedTo: [
      {
        ref: "User",
        type: Schema.Types.ObjectId,
      },
    ],
    attachments: [
      {
        filename: { required: true, type: String },
        url: { required: true, type: String },

      },
    ],
    comments: {
      default: [],
      type: [commentSchema],
    },
    createdBy: {
      ref: "User",
      required: true,
      type: Schema.Types.ObjectId,
    },
    description: {
      trim: true,
      type: String,
    },
    dueDate: {
      type: Date,
    },

    // --- Scheduling & Prioritization ---
    priority: {
      default: "Medium",
      enum: ["low", "medium", "high", "urgent"],
      type: String,
    },
    project: {
      ref: "Project",
      required: true,
      type: Schema.Types.ObjectId,
    },
    startDate: {
      type: Date,
    },
    status: {
      default: "todo",
      enum: ["todo", "in-progress", "under-review", "completed"],
      type: String,
    },

    // --- Nested Data & Collaboration ---
    subtasks: [
      {
        ref: "SubTask",
        type: Schema.Types.ObjectId,
      },
    ],
    // --- Core Fields & Relationships ---
    title: {
      required: [true, "Task title is required."],
      trim: true,
      type: String,
    },
  },
  { timestamps: true }
);

// --- OPTIMIZED INDEXING STRATEGY ---

// 1. For finding all tasks in a project, sorted by due date.
taskSchema.index({ dueDate: 1, project: 1 });

// 2. The most critical index for Kanban boards (filtering by project and status).
taskSchema.index({ project: 1, status: 1 });

// 3. For finding all tasks assigned to a specific user across all their projects.
taskSchema.index({ assignedTo: 1 });

export const Task = mongoose.model("Task", taskSchema);
