import crypto from "crypto"
import BlacklistedToken from "../models/blacklistedToken.js"
import RefreshToken from "../models/refreshToken.model.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import imagekit from "../utils/imagekit.js"
import {
  emailVerificationMailGenContent,
  forgotPasswordMailgenContent,
  reEmailVerificationMailGenContent,
  sendMail,
} from "../utils/mail.js"

// Cookie configuration helper
const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  path: "/",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production", // Must be true for sameSite: 'none'
  maxAge
})

// --- User Registration ---
export const registerUser = asyncHandler(async (req, res) => {
  const { email, password, username, fullname, avatar, role } = req.body

  if (!email || !password || !username || !fullname) {
    throw new ApiError(
      400,
      "Username, fullname, email, and password are required",
    )
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] })
  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists")
  }

  const user = await User.create({
    avatar,
    email,
    fullname,
    password,
    role,
    username,
  })

  if (!user) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  // Generate verification token
  const { unHashedToken, hashToken, tokenExpiry } =
    await user.generateTemporaryToken()
  user.emailVerificationToken = hashToken
  user.emailVerificationExpiry = tokenExpiry
  await user.save({ validateBeforeSave: false })

  // Send verification email
  const verificationUrl = `${process.env.CORS_ORIGIN}/verify/${unHashedToken}`
  const mailgenContent = emailVerificationMailGenContent(
    user.username,
    verificationUrl,
  )

  await sendMail({
    email: user.email,
    mailgenContent,
    subject: "Verify Your Email Address",
  })

  // Omit sensitive data from the final response
  const createdUser = await User.findById(user._id).select(
    "-password -emailVerificationToken",
  )

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdUser,
        "User registered successfully. Please check your email to verify your account.",
      ),
    )
})

// --- Email Verification ---
export const verifyUser = asyncHandler(async (req, res) => {
  const { token: unHashedToken } = req.params

  if (!unHashedToken) {
    throw new ApiError(400, "Verification token is missing")
  }

  const pepper = process.env.HASH_PEPPER
  if (!pepper) {
    throw new ApiError(500, "HASH_PEPPER environment variable not configured")
  }

  const hashToken = crypto
    .createHash("sha256")
    .update(unHashedToken + pepper)
    .digest("hex")

  const user = await User.findOne({
    emailVerificationExpiry: { $gt: Date.now() },
    emailVerificationToken: hashToken,
  })

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token")
  }

  user.isEmailVerified = true
  user.emailVerificationToken = undefined
  user.emailVerificationExpiry = undefined
  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Email verified successfully. You can now log in.",
      ),
    )
})

// --- Resend Verification Email ---
export const resendVerifyEmail = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(404, "User not found with this email")
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "This email is already verified")
  }

  const { unHashedToken, hashToken, tokenExpiry } =
    await user.generateTemporaryToken()
  user.emailVerificationToken = hashToken
  user.emailVerificationExpiry = tokenExpiry
  await user.save({ validateBeforeSave: false })

  const verificationUrl = `${process.env.CORS_ORIGIN}/verify/${unHashedToken}`
  const mailgenContent = reEmailVerificationMailGenContent(
    user.username,
    verificationUrl,
  )

  await sendMail({
    email: user.email,
    mailgenContent,
    subject: "Resend Email Verification",
  })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Verification email sent successfully"))
})

// --- User Login ---
export const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body

  if (!identifier || !password) {
    throw new ApiError(400, "Username/email and password are required")
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  })

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before logging in")
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password)
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials")
  }

  const accessToken = await user.generateAccessToken()
  const refreshToken = await user.generateRefreshToken()

  // Store the refresh token in the database
  await RefreshToken.create({
    deviceInfo: req.headers["user-agent"] || "unknown",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    ipAddress: req.ip || req.connection?.remoteAddress || "unknown",
    token: refreshToken,
    user: user._id,
  })

  const loggedInUser = await User.findById(user._id).select("-password")

  // FIXED: Correct maxAge values
  const accessTokenOptions = getCookieOptions(7 * 24 * 60 * 60 * 1000) // 7 days
  const refreshTokenOptions = getCookieOptions(30 * 24 * 60 * 60 * 1000) // 30 days

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken, // Also send in response body for manual storage if needed
          refreshToken
        },
        "User logged in successfully",
      ),
    )
})

// --- User Logout ---
export const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies

  if (refreshToken) {
    try {
      // Invalidate the refresh token in the database
      await RefreshToken.deleteOne({ token: refreshToken })
      await BlacklistedToken.create({
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        token: refreshToken,
        user: req.user._id,
      })
    } catch (error) {
      console.error("Error deleting refresh token from DB:", error)
    }
  }

  const cookieOptions = getCookieOptions(0) // Expire immediately

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})

// --- Refresh Access Token ---
export const refreshAccessToken = asyncHandler(async (req, res) => {
  console.log("Refreshing token...")
  const incomingRefreshToken = req.cookies.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is missing")
  }

  // 1. Find and delete the old refresh token to prevent reuse
  const oldTokenDoc = await RefreshToken.findOneAndDelete({
    token: incomingRefreshToken,
  })

  if (!oldTokenDoc || oldTokenDoc.expiresAt < new Date()) {
    throw new ApiError(401, "Invalid or expired refresh token")
  }

  // 2. Verify the user still exists
  const user = await User.findById(oldTokenDoc.user)
  if (!user) {
    throw new ApiError(401, "User not found for this token")
  }

  console.log("User found: " + user.username)

  // 3. Issue new tokens
  const newAccessToken = await user.generateAccessToken()
  const newRefreshToken = await user.generateRefreshToken()

  // 4. Store the new refresh token
  await RefreshToken.create({
    deviceInfo: req.headers["user-agent"] || "unknown",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    ipAddress: req.ip || "unknown",
    token: newRefreshToken,
    user: user._id,
  })

  // FIXED: Use consistent cookie options
  const accessTokenOptions = getCookieOptions(7 * 24 * 60 * 60 * 1000) // 7 days
  const refreshTokenOptions = getCookieOptions(30 * 24 * 60 * 60 * 1000) // 30 days

  // 5. Set new cookies and send response
  return res
    .status(200)
    .cookie("accessToken", newAccessToken, accessTokenOptions)
    .cookie("refreshToken", newRefreshToken, refreshTokenOptions)
    .json(
      new ApiResponse(
        200,
        {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        },
        "Tokens refreshed successfully"
      )
    )
})

// --- Password Management ---
export const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(404, "User not found with this email")
  }

  const { unHashedToken, hashToken, tokenExpiry } =
    await user.generateTemporaryToken()
  user.forgotPasswordToken = hashToken
  user.forgotPasswordExpiry = tokenExpiry
  await user.save({ validateBeforeSave: false })

  const resetUrl = `${process.env.CORS_ORIGIN}/reset-password/${unHashedToken}`
  const mailgenContent = forgotPasswordMailgenContent(user.username, resetUrl)

  await sendMail({
    email: user.email,
    mailgenContent,
    subject: "Password Reset Request",
  })

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset instructions sent to your email",
      ),
    )
})

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params
  const { password } = req.body
  const pepper = process.env.HASH_PEPPER

  if (!token) {
    throw new ApiError(400, "Password reset token is missing")
  }

  if (!password) {
    throw new ApiError(400, "New password is required")
  }

  const hashToken = crypto
    .createHash("sha256")
    .update(token + pepper)
    .digest("hex")

  const user = await User.findOne({
    forgotPasswordExpiry: { $gt: Date.now() },
    forgotPasswordToken: hashToken,
  })

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token")
  }

  user.password = password
  user.forgotPasswordToken = undefined
  user.forgotPasswordExpiry = undefined
  await user.save()

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password has been reset successfully."))
})

// --- User Profile ---
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password")
  if (!user) {
    throw new ApiError(404, "User not found")
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"))
})

export const getActiveSession = asyncHandler(async (req, res) => {
  const activeSessions = await RefreshToken.find({ user: req.user._id })
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { count: activeSessions.length, sessions: activeSessions },
        "Active sessions fetched successfully",
      ),
    )
})

export const updateUserAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Avatar image file is required")
  }

  try {
    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: "avatars",
    })

    const user = await User.findById(req.user._id)
    if (!user) {
      throw new ApiError(404, "User not found")
    }

    user.avatar.url = result.url
    await user.save({ validateBeforeSave: false })

    const updatedUser = await User.findById(req.user._id).select("-password")

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"))
  } catch (error) {
    console.error("ImageKit Upload Error:", error)
    throw new ApiError(500, "Failed to upload avatar due to a server error.")
  }
})