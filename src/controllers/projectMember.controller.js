import { Project } from "../models/project.model";
import { User } from "../models/user.model";
import ApiError from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";

const addMember = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(401, "Project Id not found from params");
  }
  const project = await Project.find({ _id: projectId });
  if (!project) {
    throw new ApiError(404, "Project not found in database.");
  }
  await User.findById();
});
