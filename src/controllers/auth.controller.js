import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  forgetPasswordService,
  loginUserService,
  logoutUserService,
  registerUserService,
  verifyUserService,
  resetPasswordService,
  resendVerificationEmailService,
} from "../services/auth.service.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/api-error.js";
import RefreshToken from "../models/refreshToken.model.js";

const registerUser = asyncHandler(async (req, res, next) => {
  const { email, password, username, fullname, avatar, role } = req.body;
  const createUser = await registerUserService(
    {
      email,
      password,
      username,
      fullname,
      avatar,
      role,
    },
    req,
    res,
    next
  );
  if (createUser) {
    res.status(201).json(new ApiResponse(201, createUser, "User Created Successfully"));
  }
});
const verifyUser = asyncHandler(async (req, res, next) => {
  // get token from url
  // verify token
  // update user as verify true
  // give message to user
  const { token } = req.params;
  // console.log(token);

  if (!token) {
    throw new ApiError(401, "Token not fount form params", [], undefined, false);
  }

  const verifyUser = await verifyUserService(token, req, res, next);

  next();
  // const unHashedToken = await user.unHashToken(token);

  // if (!unHashedToken) {
  //   throw new ApiError(
  //     401,
  //     "Please provide valid token ",
  //     [],
  //     undefined,
  //     false
  //   );
  // }
});

const resendVerifyEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required", undefined, undefined, false);
  }
  await resendVerificationEmailService(email, req, res);
  next();
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;
  //console.log(username, email, password);
  if (!(username || email) && !password) {
    throw new ApiError(401, "Provide full login details", [], undefined, false);
  }

  await loginUserService(
    {
      username,
      email,
      password,
    },
    req,
    res,
    next
  );
  next();
});

const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id); // req.user;
  if (!user) {
    throw new ApiError(404, "User not found", [], undefined, false);
  }

  return res.status(200).json(new ApiResponse(200, user, "User Profile fetched successfully"));
});

const getActiveSession = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ApiError(404, "User not found", [], undefined, false));
  }
  return res.status(200).json(new ApiResponse(200, user, "Active session fetched successfully"));
});

const logoutUser = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  // console.log(refreshToken);
  if (!refreshToken) {
    throw new ApiError(401, "Token not found in cookie", [], undefined, false);
  }
  const logoutUser = await logoutUserService(refreshToken, req, res, next);

  if (logoutUser) {
    res.status(200).json(new ApiResponse(200, logoutUser, "User logged out successfully"));
  }
  next();
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  // console.log(refreshToken);
  if (!refreshToken) {
    throw new ApiError(404, "Token not found", [], undefined, false);
  }
  const RefreshTokenDoc = await RefreshToken.findOne({ token: refreshToken });
  console.log(RefreshTokenDoc);
  if (!RefreshTokenDoc) {
    throw new ApiError(404, "Invalid Token", [], undefined, false);
  }

  if (!refreshToken || refreshToken.expiresAt < new Date()) {
    throw new ApiError(404, "Invalid or expired refresh token.", [], undefined, false);
  }

  RefreshTokenDoc.token = "";
  const userId = await User.findById(RefreshTokenDoc.user);
  // console.log(userId);

  if (!userId) {
    throw new ApiError(404, "User not found", [], undefined, false);
  }
  const user = await User.findById(userId._id);
  if (!user) {
    throw new ApiError(404, "User not found", [], undefined, false);
  }

  const accessTokens = await user.generateAccessToken();
  const refreshTokens = await user.generateRefreshToken();

  if (!accessTokens || !refreshTokens) {
    throw new ApiError(402, "Something went wrong while generating token", undefined, "", false);
  }

  const token = await RefreshToken.create({
    token: refreshTokens,
    user: user._id,
    deviceInfo: req.headers["user-agent"] || "unknown",
    ipAddress: req.ip || "unknown",
  });
  if (!token) {
    throw new ApiError(500, "Failed to store refresh token");
  }
  await token.save();

  res.status(202).json(new ApiResponse(202, token, "Tokens updated"));
  next();
});

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required", undefined, undefined, false);
  }

  await forgetPasswordService({ email }, req, res);
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  console.log(password);
  if (!token || !password) {
    throw new ApiError(400, "Token and new password are required", undefined, undefined, false);
  }

  const resetPassword = await resetPasswordService(token, password, res, next);
  next();
});
export {
  registerUser,
  verifyUser,
  loginUser,
  logoutUser,
  forgetPassword,
  resetPassword,
  resendVerifyEmail,
  refreshAccessToken,
  getUserProfile,
  getActiveSession,
};
