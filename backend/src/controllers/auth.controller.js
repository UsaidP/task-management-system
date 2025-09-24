import crypto from "crypto";
import { User } from "../models/user.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import ApiError from "../utils/api-error.js";
import { sendMail } from "../utils/mail.js";
import {
  emailVerificationMailGenContent,
  forgotPasswordMailgenContent,
  reEmailVerificationMailGenContent,
} from "../utils/mail.js";

// --- User Registration ---
export const registerUser = asyncHandler(async (req, res) => {
  const { email, password, username, fullname, avatar, role } = req.body;

  if (!email || !password || !username || !fullname) {
    throw new ApiError(400, "Username, fullname, email, and password are required");
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists"); // 409 Conflict is more appropriate
  }

  const user = await User.create({
    email,
    password,
    username,
    fullname,
    avatar,
    role,
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Generate verification token
  const { unHashedToken, hashToken, tokenExpiry } = await user.generateTemporaryToken();
  user.emailVerificationToken = hashToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  // Send verification email
  const verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/users/verify/${unHashedToken}`;
  const mailgenContent = emailVerificationMailGenContent(user.username, verificationUrl);

  await sendMail({
    email: user.email,
    subject: "Verify Your Email Address",
    mailgenContent,
  });

  // Omit sensitive data from the final response
  const createdUser = await User.findById(user._id).select("-password -emailVerificationToken");

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdUser,
        "User registered successfully. Please check your email to verify your account."
      )
    );
});

// --- Email Verification ---
export const verifyUser = asyncHandler(async (req, res) => {
  const { token: unHashedToken } = req.params;

  if (!unHashedToken) {
    throw new ApiError(400, "Verification token is missing");
  }

  const hashToken = crypto.createHash("sha256").update(unHashedToken).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully. You can now log in."));
});

// --- Resend Verification Email ---
export const resendVerifyEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found with this email");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "This email is already verified");
  }

  const { unHashedToken, hashToken, tokenExpiry } = await user.generateTemporaryToken();
  user.emailVerificationToken = hashToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/users/verify/${unHashedToken}`;
  const mailgenContent = reEmailVerificationMailGenContent(user.username, verificationUrl);

  await sendMail({
    email: user.email,
    subject: "Resend Email Verification",
    mailgenContent,
  });

  return res.status(200).json(new ApiResponse(200, {}, "Verification email sent successfully"));
});

// --- User Login ---
export const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new ApiError(400, "Username/email and password are required");
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });
  // console.log(user);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before logging in"); // 403 Forbidden
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials"); // 401 Unauthorized
  }

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  // Store the refresh token in the database
  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    deviceInfo: req.headers["user-agent"] || "unknown",
    ipAddress: req.ip || req.connection?.remoteAddress || "unknown",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });

  const loggedInUser = await User.findById(user._id).select("-password");

  const baseCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
  };

  const accessTokenCookieOptions = {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  };

  const refreshTokenCookieOptions = {
    ...baseCookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
  console.log(
    res
      .status(200)
      .cookie("accessToken", accessToken, accessTokenCookieOptions)
      .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
  );
  return res
    .cookie("accessToken", accessToken, accessTokenCookieOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .status(200)
    .json(new ApiResponse(200, { user: loggedInUser }, "User logged in successfully"));
});

// --- User Logout ---
export const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    // Delete the refresh token from the database to invalidate it
    await RefreshToken.deleteOne({ token: refreshToken });
  }

  // Clear cookies from the browser
  res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "none" });
  res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "none" });

  return res.status(200).json(new ApiResponse(200, {}, "User logged out successfully"));
});

// --- Refresh Access Token ---
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is missing");
  }

  // 1. Find and delete the old refresh token to prevent reuse
  const oldTokenDoc = await RefreshToken.findOneAndDelete({ token: incomingRefreshToken });
  if (!oldTokenDoc || oldTokenDoc.expiresAt < new Date()) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // 2. Verify the user still exists
  const user = await User.findById(oldTokenDoc.user);
  if (!user) {
    throw new ApiError(401, "User not found for this token");
  }

  // 3. Issue new tokens
  const newAccessToken = await user.generateAccessToken();
  const newRefreshToken = await user.generateRefreshToken();

  // 4. Store the new refresh token
  await RefreshToken.create({
    token: newRefreshToken,
    user: user._id,
    deviceInfo: req.headers["user-agent"] || "unknown",
    ipAddress: req.ip || "unknown",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });

  const baseCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
  };

  // 5. Set new cookies and send response
  return res
    .status(200)
    .cookie("accessToken", newAccessToken, { ...baseCookieOptions, maxAge: 15 * 60 * 1000 })
    .cookie("refreshToken", newRefreshToken, {
      ...baseCookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .json(new ApiResponse(200, {}, "Tokens refreshed successfully"));
});

// --- Password Management ---
export const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found with this email");
  }

  const { unHashedToken, hashToken, tokenExpiry } = await user.generateTemporaryToken();
  user.forgotPasswordToken = hashToken;
  user.forgotPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CORS_ORIGIN}/reset-password/${unHashedToken}`;
  const mailgenContent = forgotPasswordMailgenContent(user.username, resetUrl);

  await sendMail({
    email: user.email,
    subject: "Password Reset Request",
    mailgenContent,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset instructions sent to your email"));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, "New password is required");
  }

  const hashToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();

  return res.status(200).json(new ApiResponse(200, {}, "Password has been reset successfully."));
});

// --- User Profile ---
export const getUserProfile = asyncHandler(async (req, res) => {
  // The user object is attached to req by the 'verifyJWT' middleware
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res.status(200).json(new ApiResponse(200, user, "User profile fetched successfully"));
});

export const getActiveSession = asyncHandler(async (req, res) => {
  // This could be enhanced to show all active refresh tokens for the user
  const activeSessions = await RefreshToken.find({ user: req.user._id });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { count: activeSessions.length, sessions: activeSessions },
        "Active sessions fetched successfully"
      )
    );
});
