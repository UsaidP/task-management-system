import mongoose, { Schema } from "mongoose"
import { AvailableUserRole, UserRoleEnum } from "../utils/constants.js"

const projectMemberSchema = new Schema(
	{
		project: {
			ref: "Project",
			required: true,
			type: Schema.Types.ObjectId,
		},
		role: {
			default: UserRoleEnum.MEMBER,
			enum: AvailableUserRole,
			required: true,
			type: String,
		},
		user: {
			ref: "User",
			required: true,
			type: Schema.Types.ObjectId,
		},
	},
	{ timestamps: true },
)
projectMemberSchema.index({ project: 1, user: 1 }, { unique: true })
export const ProjectMember = mongoose.model(
	"ProjectMember",
	projectMemberSchema,
)
