import mongoose, { Schema } from "mongoose";
import { AvailableUserRole, UserRoleEnum } from "../utils/constants.js";

const projectMemberSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: AvailableUserRole,
      default: UserRoleEnum.MEMBER,
    },
  },
  { timestamps: true }
);

export const ProjectMember = mongoose.model("ProjectMember", projectMemberSchema);
