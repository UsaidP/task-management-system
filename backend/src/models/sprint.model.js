import mongoose, { Schema } from "mongoose"

const sprintSchema = new Schema(
	{
		endDate: {
			required: true,
			type: Date,
		},
		goal: {
			trim: true,
			type: String,
		},
		name: {
			required: true,
			trim: true,
			type: String,
		},
		project: {
			ref: "Project",
			required: true,
			type: Schema.Types.ObjectId,
		},
		startDate: {
			required: true,
			type: Date,
		},
		status: {
			default: "backlog",
			enum: ["backlog", "planning", "active", "completed"],
			type: String,
		},
	},
	{ timestamps: true },
)

sprintSchema.index({ project: 1, status: 1 })

export const Sprint = mongoose.model("Sprint", sprintSchema)
