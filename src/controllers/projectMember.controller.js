import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

export const addMember = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { userId, role } = req.body;
  if (!projectId) {
    throw new ApiError(401, "Project Id not found from params");
  }
  const project = await Project.find({ _id: projectId });
  if (!project) {
    throw new ApiError(404, "Project not found in database.");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found in database.");
  }
  if (!role || (role && !["admin", "project_admin", "member"].includes(role))) {
    throw new ApiError(
      400,
      "Role must be either 'admin' 'project_admin' or 'member'."
    );
  }
  const existingMember = await ProjectMember.findOne({
    project: projectId,
    user: userId,
    role: role,
  });
  if (existingMember) {
    throw new ApiError(
      400,
      "User is already a member of this project.",
      undefined,
      undefined,
      false
    );
  }

  const projectMember = await ProjectMember.create({
    project: projectId,
    user: userId,
    role: role || "member",
  });

  if (projectMember && projectMember.role === "admin") {
    await Project.updateOne({ _id: projectId }, { $set: { admin: userId } });
  }
  if (!projectMember) {
    throw new ApiError(
      500,
      "Something went wrong while adding member to project."
    );
  }
  res.status(201).json(new ApiResponse(201, projectMember, "Member added"));
});
