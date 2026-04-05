import mongoose, { Schema } from "mongoose"
import { AvailableUserRole, ProjectRoleEnum } from "../utils/constants.js"

const projectMemberSchema = new Schema(
  {
    // Track when member was removed
    deactivatedAt: Date,
    deactivatedBy: {
      ref: "User",
      type: Schema.Types.ObjectId,
    },
    // For soft delete - track inactive members
    isActive: {
      default: true,
      type: Boolean,
    },
    project: {
      ref: "Project",
      required: true,
      type: Schema.Types.ObjectId,
    },
    role: {
      default: ProjectRoleEnum.MEMBER,
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

// Unique index for active members only
projectMemberSchema.index({ isActive: 1, project: 1, user: 1 }, { unique: true })

// Index for finding all projects a user is a member of
projectMemberSchema.index({ user: 1 })

// Index for finding active members of a project
projectMemberSchema.index({ isActive: 1, project: 1 })

// Helper method to check if user has permission
projectMemberSchema.methods.hasPermission = function (permission) {
  const { ROLE_PERMISSIONS } = require("../utils/constants.js")
  const permissions = ROLE_PERMISSIONS[this.role] || []
  return permissions.includes(permission)
}

export const ProjectMember = mongoose.model("ProjectMember", projectMemberSchema)
export default ProjectMember
