import { asyncHandler } from "../utils/async-handler.js";
import { blacklistedToken, User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import ApiError from "../utils/api-error.js";
import {
  emailVerificationMailGenContent,
  forgotPasswordMailgenContent,
  reEmailVerificationMailGenContent,
} from "../utils/mail.js";
import crypto from "crypto";
import { sendMail } from "../utils/mail.js";
import RefreshToken from "../models/refreshToken.model.js";

const registerUserService = asyncHandler(async (data, req, res, next) => {
  const { email, password, username, fullname, avatar, role } = data;
  // console.log(email);
  // check if all field are present or not in request body
  if (!email || !password || !username || !fullname || !role) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User is already register", undefined, "", false);
  }

  const createUser = await User.create({
    email,
    fullname,
    password,
    username,
    avatar,
    role,
  });
  if (!createUser) {
    throw new ApiError(
      402,
      "Something went wrong while adding use in db",
      "something went wrong",
      "",
      false
    );
  }
  const { hashToken, unHashedToken, tokenExpiry } =
    await createUser.generateTemporaryToken();

  // console.log(`${hashToken}\n  , ${unHashedToken} \n, ${tokenExpiry}`);
  createUser.emailVerificationToken = hashToken;
  createUser.emailVerificationExpiry = tokenExpiry;
  await createUser.save();

  //Email
  const verificationUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/verify/${unHashedToken}`;

  console.log(verificationUrl);

  const mailgenContent = emailVerificationMailGenContent(
    createUser.username,
    verificationUrl
  );
  console.log(mailgenContent);
  await sendMail({
    email,
    subject: "verify user",
    mailgenContent: mailgenContent,
  });
  res
    .status(201)
    .json(new ApiResponse(201, createUser, "User Create Successfully"));
});

const verifyUserService = asyncHandler(async (unHashedToken, req, res) => {
  const hashToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  const user = await User.findOne({ emailVerificationToken: hashToken });
  // console.log(user);
  if (!user) {
    throw new ApiError(
      401,
      "Please provide valid token ",
      [],
      undefined,
      false
    );
  }
  if (Date.now() > user.emailVerificationExpiry) {
    throw new ApiError(401, "Token is expired ", undefined, "", false);
  }
  user.isEmailVerified = true;
  user.emailVerificationToken = "";
  await user.save();
  console.log(user);
  return res
    .status(202)
    .json(new ApiResponse(202, "Email verified successfully"));
});

const resendVerificationEmailService = asyncHandler(async (email, req, res) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(
      401,
      "User not found with this email",
      [],
      undefined,
      false
    );
  }
  const { hashToken, unHashedToken, tokenExpiry } =
    await user.generateTemporaryToken();
  if ((!hashToken, !unHashedToken, !tokenExpiry)) {
    throw new ApiError(404, "Tokens not found", [], undefined, false);
  }
  user.emailVerificationToken = hashToken;
  user.emailVerificationExpiry = tokenExpiry;
  user.save();

  const reVerificationUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/verify/${unHashedToken}`;

  const mailgenContent = reEmailVerificationMailGenContent(
    user.username,
    reVerificationUrl
  );

  if (!mailgenContent) {
    throw new ApiError(403, "Email not send", [], undefined, false);
  }
  await sendMail({
    email: email,
    subject: "verify user",
    mailgenContent: mailgenContent,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, "Resend Email Successfully "));
});

const loginUserService = asyncHandler(async (data, req, res, next) => {
  const { username, email, password } = data;
  // console.info(req);
  // Find user by email or username
  const user = await User.findOne({
    $or: [email ? { email } : null, username ? { username } : null].filter(
      Boolean
    ),
  });

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiError(402, "Provide valid credentials");
  }
  const accessTokens = await user.generateAccessToken();
  const refreshTokens = await user.generateRefreshToken();

  if (!accessTokens || !refreshTokens) {
    throw new ApiError(
      402,
      "Something went wrong while generating token",
      undefined,
      "",
      false
    );
  }

  const isBlacklisted = await blacklistedToken(refreshTokens);

  if (!isBlacklisted) {
    throw new ApiError(
      401,
      "Error while blacklisting token",
      undefined,
      "",
      false
    );
  }

  const now = Date.now();
  const expiryDate = new Date(now + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  const isRefreshTokenStored = await RefreshToken.create({
    token: refreshTokens,
    user: user._id,
    deviceInfo: req.headers["user-agent"] || "unknown",
    ipAddress: req.ip || req.connection?.remoteAddress || "unknown",
    issuedAt: new Date(now),
    lastUsedAt: new Date(now),
    expiresAt: expiryDate,
  });

  console.log(isRefreshTokenStored);

  if (!isRefreshTokenStored) {
    throw new ApiError(500, "Failed to store refresh token");
  }

  await isRefreshTokenStored.save();
  // console.log(refreshTokens);
  // console.log(user);
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  };
  console.log();
  res.cookie("accessToken", accessTokens, cookieOptions);
  res.cookie("refreshToken", refreshTokens, cookieOptions);

  res.status(201).json(new ApiResponse(201, user, "User logged In"));
  next();
});

const logoutUserService = asyncHandler(async (refreshToken, req, res, next) => {
  const tokenDoc = await RefreshToken.findOne({ token: refreshToken });

  if (!tokenDoc) {
    throw new ApiError(401, "Invalid token provided", [], undefined, false);
  }

  await RefreshToken.deleteOne({ token: refreshToken });
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");

  res
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully"));
  return next();
});

const forgetPasswordService = asyncHandler(async (data, req, res) => {
  const { email } = data;

  if (!email) {
    throw new ApiError(400, "Email is required", [], undefined, false);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(
      404,
      "User not found with this email",
      [],
      undefined,
      false
    );
  }

  const { hashToken, unHashedToken, tokenExpiry } =
    await user.generateTemporaryToken();

  if (!hashToken || !unHashedToken || !tokenExpiry) {
    throw new ApiError(
      500,
      "Failed to generate reset token",
      [],
      undefined,
      false
    );
  }

  user.forgotPasswordToken = hashToken;
  user.forgotPasswordExpiry = tokenExpiry;

  await user.save();

  const passwordResetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/reset-password/${unHashedToken}`;

  const mailgenContent = forgotPasswordMailgenContent(
    user.username,
    passwordResetUrl
  );

  try {
    await sendMail({
      email,
      subject: "Password Reset Request",
      mailgenContent,
    });
  } catch (error) {
    throw new ApiError(
      500,
      "Failed to send reset email",
      [],
      error.stack,
      false
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { message: "Password reset instructions sent to your email" },
        "Reset email sent successfully"
      )
    );
});

const resetPasswordService = asyncHandler(async (token, newPassword, res) => {
  if (!token || !newPassword) {
    throw new ApiError(
      400,
      "Token and new password are required",
      [],
      undefined,
      false
    );
  }

  const hashToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(
      401,
      "Invalid or expired reset token",
      [],
      undefined,
      false
    );
  }

  user.password = newPassword;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();
  console.log(user);
  res
    .status(200)
    .json(new ApiResponse(200, user.password, "Password updated successfully"));
  next();
});

export {
  registerUserService,
  verifyUserService,
  loginUserService,
  logoutUserService,
  forgetPasswordService,
  resetPasswordService,
  resendVerificationEmailService,
};
