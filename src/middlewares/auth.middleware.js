import jwt from "jsonwebtoken";
import blacklistedToken from "../models/blacklistedToken.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import ApiError from "../utils/api-error.js";

const protect = asyncHandler(async (req, res, next) => {
  console.log("req.cookies", req.cookies);
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
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

const authorize = async (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `User role ${req.user.role} is not authorized to access this route`,
        [],
        undefined,
        false
      );
    }
    next();
  };
};

export { protect, authorize };
