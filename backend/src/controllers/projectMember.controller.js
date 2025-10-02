import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

export const addMember = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { email, role } = req.body;
  console.info(email);
  if (!projectId) {
    throw new ApiError(401, "Project Id not found from params");
  }
  if (!email) {
    throw new ApiError(403, "Email is required.");
  }
  if (!role) {
    throw new ApiError(403, "Role is required.");
  }
  const project = await Project.find({ _id: projectId });
  // console.log(project);
  if (!project) {
    throw new ApiError(404, "Project not found in database.");
  }
  const user = await User.findOne({ email: email });
  const userId = user?._id;
  console.log(user);
  if (!user) {
    throw new ApiError(404, "User not found in database.");
  }
  if (!role || (role && !["admin", "project_admin", "member"].includes(role))) {
    throw new ApiError(400, "Role must be either 'admin' 'project_admin' or 'member'.");
  }
  const existingMember = await ProjectMember.findOne({
    project: projectId,
    user: userId,
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
    throw new ApiError(500, "Something went wrong while adding member to project.");
  }
  res.status(201).json(new ApiResponse(201, projectMember, "Member added"));
  next();
});
export const updateMember = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { userId, role } = req.body;
  if (!projectId) {
    throw new ApiError(401, "Project Id not found from params");
  }
  if (!userId) {
    throw new ApiError(400, "User ID is required.");
  }
  if (!role) {
    throw new ApiError(400, "Role is required.");
  }
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found in database.");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found in database.");
  }
  if (!role || (role && !["admin", "project_admin", "member"].includes(role))) {
    throw new ApiError(400, "Role must be either 'admin' 'project_admin' or 'member'.");
  }

  const updatedMember = await ProjectMember.findOneAndUpdate(
    { project: projectId, user: userId },
    { role: role },
    { new: true }
  );

  if (!updatedMember) {
    throw new ApiError(500, "Something went wrong while updating member in project.");
  }

  res.status(200).json(new ApiResponse(200, updatedMember, "Member updated"));
  next();
});

export const removeMember = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { userId } = req.body;

  if (!projectId || !userId) {
    throw new ApiError(400, "Project ID and User ID are required.");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found.");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const projectMember = await ProjectMember.findOneAndDelete({
    project: projectId,
    user: userId,
  });

  if (!projectMember) {
    throw new ApiError(404, "Project member not found.");
  }

  res.status(200).json(new ApiResponse(200, null, "Member removed successfully"));
  next();
});

export const getAllMembers = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(400, "Project ID is required.");
  }

  const members = await ProjectMember.find({ project: projectId })
    .populate("user", "email")
    .populate("project", "name ");

  if (!members || members.length === 0) {
    throw new ApiError(404, "No members found for this project.");
  }

  res.status(200).json(new ApiResponse(200, members, "Project members retrieved"));
  next();
});
export const projectMemberController = {
  addMember,
  updateMember,
  removeMember,
  getAllMembers,
};
