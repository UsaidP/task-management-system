import jwt from "jsonwebtoken";
import blacklistedToken from "../models/blacklistedToken.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import { ProjectMember } from "../models/projectmember.model.js";
import mongoose from "mongoose";

export const protect = asyncHandler(async (req, res, next) => {
  // console.log("req.cookies", req.cookies);
  const extractTokenFromRequest = (req) => {
    if (req.headers.authorization?.startsWith("Bearer")) {
      return req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      return req.cookies.accessToken;
    } else if (req.cookies?.token) {
      // Legacy support
      return req.cookies.token;
    }
    return null;
  };
  const token = req.cookies.token || extractTokenFromRequest(req);
  if (!token) {
    throw new ApiError(401, "Not Authorized access route", [], undefined, false);
  }
  const isBlacklisted = await blacklistedToken.findOne({ token });
  if (isBlacklisted) {
    throw new ApiError(401, "Session expired, please login again", [], undefined, false);
  }
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, {
    ignoreExpiration: false,
  });

  if (!decoded) {
    throw new ApiError(401, "Not Authorized access route", [], undefined, false);
  }
  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError(404, "No user found with this id", [], undefined, false);
  }
  req.user = user;
  next();
});

export const validateProjectPermission = (allowedRoles = []) =>
  asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;

    const userId = req.user?._id;
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, "Project Id is missing or invalid.");
    }
    console.log(userId);
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "User Id is missing or invalid.");
    }

    const user = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(userId),
    });
    console.log(user);

    if (!user) {
      throw new ApiError(404, `You are not a part of this project.`);
    }

    const userRole = user.role;
    // console.log(userRole);
    req.user.role = userRole;
    // console.log(allowedRoles);
    // console.log(!allowedRoles.includes(userRole));
    if (!allowedRoles.includes(userRole)) {
      throw new ApiError(403, "You do not have permission to perform this action.");
    }

    // ✅ All checks passed; proceed:
    next();
  });

/**
 * Validate that the user making the request has permission to interact with the task specified in the route.
 * @param {string[]} allowedRoles - The roles that are allowed to interact with the task. If empty, all roles are allowed.
 * @returns {import('express').RequestHandler}
 */

export const validateTaskPermission = (allowedRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    console.log("params", req.params);
    const { projectId } = req.params;
    const userId = req.user?._id;

    console.log("user", userId);
    console.log("taskID", projectId);
    console.log("project", new mongoose.Types.ObjectId(projectId));
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, "Task Id is missing or invalid.");
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "User Id is missing or invalid.");
    }

    const user = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(userId),
    });
    console.log(user);
    if (!user) {
      throw new ApiError(404, `You are not a part of this task.`);
    }
    const userRole = user.role;
    console.log(userRole);
    req.user.role = userRole;
    if (!allowedRoles.includes(userRole)) {
      throw new ApiError(403, "You do not have permission to perform this action.");
    }
    next();
  });
};
