import mongoose, { Schema } from "mongoose"

const projectSchema = new Schema(
	{
		createdBy: {
			ref: "User",
			required: true,
			type: Schema.Types.ObjectId,
		},
		description: {
			required: true,
			trim: true,
			type: String,
		},
		name: {
			required: true,
			trim: true,
			type: String,
		},
	},
	{ timestamps: true },
)

// Create compound unique index to allow same project names for different users
projectSchema.index({ createdBy: 1, name: 1 }, { unique: true })

export const Project = mongoose.model("Project", projectSchema)
