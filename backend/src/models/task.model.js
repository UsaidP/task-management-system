import mongoose, { Schema } from "mongoose";

// A sub-schema for comments to keep collaboration organized within the task.
const commentSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
		content: { type: String, required: true, trim: true },
	},
	{ timestamps: { createdAt: true, updatedAt: false } },
);

const taskSchema = new Schema(
	{
		// --- Core Fields & Relationships ---
		title: {
			type: String,
			required: [true, "Task title is required."],
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		project: {
			type: Schema.Types.ObjectId,
			ref: "Project",
			required: true,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		// --- Assignment & Status ---
		assignedTo: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		],
		status: {
			type: String,
			enum: ["todo", "in-progress", "under-review", "completed"],
			default: "todo",
		},

		// --- Scheduling & Prioritization ---
		priority: {
			type: String,
			enum: ["Low", "Medium", "High", "Urgent"],
			default: "Medium",
		},
		startDate: {
			type: Date,
		},
		dueDate: {
			type: Date,
		},

		// --- Nested Data & Collaboration ---
		subtasks: [
			{
				type: Schema.Types.ObjectId,
				ref: "SubTask",
			},
		],
		comments: {
			type: [commentSchema],
			default: [],
		},
		attachments: [
			{
				url: { type: String, required: true },
				filename: { type: String, required: true },
			},
		],
	},
	{ timestamps: true },
);

// --- OPTIMIZED INDEXING STRATEGY ---

// 1. For finding all tasks in a project, sorted by due date.
taskSchema.index({ project: 1, dueDate: 1 });

// 2. The most critical index for Kanban boards (filtering by project and status).
taskSchema.index({ project: 1, status: 1 });

// 3. For finding all tasks assigned to a specific user across all their projects.
taskSchema.index({ assignedTo: 1 });

export const Task = mongoose.model("Task", taskSchema);
