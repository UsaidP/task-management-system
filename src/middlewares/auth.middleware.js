import jwt from "jsonwebtoken";
import blacklistedToken from "../models/blacklistedToken.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";
import { ProjectMember } from "../models/projectmember.model.js";
import mongoose from "mongoose";

const protect = asyncHandler(async (req, res, next) => {
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
    throw new ApiError(
      401,
      "Not Authorized access route",
      [],
      undefined,
      false
    );
  }
  const isBlacklisted = await blacklistedToken.findOne({ token });
  if (isBlacklisted) {
    throw new ApiError(
      401,
      "Session expired, please login again",
      [],
      undefined,
      false
    );
  }
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, {
    ignoreExpiration: false,
  });

  if (!decoded) {
    throw new ApiError(
      401,
      "Not Authorized access route",
      [],
      undefined,
      false
    );
  }
  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError(404, "No user found with this id", [], undefined, false);
  }
  req.user = user;
  next();
});

// const authorize = async (...roles) => {
//   console.log(roles);
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       throw new ApiError(
//         403,
//         `User role ${req.user.role} is not authorized to access this route`,
//         [],
//         undefined,
//         false
//       );
//     }
//     next();
//   };
// };

export const validateProjectPermission = (role = []) => {
  return asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    if (!projectId) {
      throw new ApiError(403, error?.message || "Project Id is invalid!.");
    }
    const project = await ProjectMember.findOne({
      project: mongoose.Types.ObjectId(projectId),
      user: mongoose.Types.ObjectId(req.user._id),
    });
    if (!project) {
      throw new ApiError(401, "Project not found");
    }
    const givenRole = project?.role;
    req.user.role = givenRole;

    if (!role.includes(givenRole)) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action.",
        [],
        "",
        false,
        error
      );
    }
  });
};

export { protect };
