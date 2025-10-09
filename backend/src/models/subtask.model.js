import mongoose, { Schema } from "mongoose"

const subTaskSchema = new Schema(
	{
		createdBy: {
			ref: "User",
			required: true,
			type: Schema.Types.ObjectId,
		},
		isCompleted: {
			default: false,
			type: Boolean,
		},
		task: {
			ref: "Task",
			required: true,
			type: Schema.Types.ObjectId,
		},
		title: {
			required: true,
			trim: true,
			type: String,
		},
	},
	{ timestamps: true },
)
subTaskSchema.index({ task: 1 })

export const SubTask = mongoose.model("SubTask", subTaskSchema)
