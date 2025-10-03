import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import { ProjectMember } from "../models/projectmember.model.js";
import mongoose from "mongoose";
import BlacklistedToken from "../models/blacklistedToken.js";

const extractTokenFromRequest = (req) => {
  // Prefer Authorization header first as it's the standard
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }

  // Fallback to cookies
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }
  if (req.cookies?.refreshToken) {
    return req.cookies.refreshToken;
  }

  return null;
};

export const protect = asyncHandler(async (req, res, next) => {
  const token = extractTokenFromRequest(req);
  console.log("Token: " + token);
  if (!token) {
    // 401: Unauthorized - The client needs to authenticate.
    throw new ApiError(401, "Unauthorized request. No token provided.");
  }

  try {
    // 1. Verify the token's signature and expiration
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 2. Check if the token has been blacklisted (i.e., user logged out)
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      throw new ApiError(401, "Session has expired. Please log in again.");
    }

    // 3. Find the user from the token's payload
    // Use lean() for a performance boost as we only need to read user data
    const user = await User.findById(decoded?._id).lean();

    if (!user) {
      // 401: Unauthorized - The user associated with this valid token no longer exists.
      throw new ApiError(401, "The user belonging to this token does no longer exist.");
    }

    // 4. Attach the user object to the request for downstream handlers
    req.user = user;
    console.log(user + " here");
    next();
  } catch (error) {
    // Catch specific JWT errors for better client feedback
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Session has expired. Please log in again.");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, "Invalid token. Please log in again.");
    }
    // Forward any other caught errors
    throw error;
  }
});

export const validateProjectPermission = (allowedRoles = []) => {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    throw new Error("allowedRoles must be a non-empty array");
  }

  return asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    // Validate projectId
    if (!isValidObjectId(projectId)) {
      throw new ApiError(400, "Invalid project ID.");
    }

    // Find user's membership in the project
    const membership = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(userId),
    }).lean();

    if (!membership) {
      throw new ApiError(403, "Access denied. You are not a member of this project.");
    }

    const userRole = membership.role;

    // Check if user has required role
    if (!allowedRoles.includes(userRole)) {
      throw new ApiError(
        403,
        `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${userRole}.`
      );
    }

    // Attach role and membership to request for downstream use
    req.user.projectRole = userRole;
    req.user.membershipId = membership._id;

    next();
  });
};
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
