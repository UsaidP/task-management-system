import crypto from "node:crypto"
import ms from "ms"
import BlacklistedToken from "../models/blacklistedToken.js"
import RefreshToken from "../models/refreshToken.model.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import { logAudit } from "../utils/audit-log.js"
import imagekit from "../utils/imagekit.js"
import {
  emailVerificationMailGenContent,
  forgotPasswordMailgenContent,
  reEmailVerificationMailGenContent,
  sendMail,
} from "../utils/mail.js"

// How long a user must wait before requesting another verification email (in ms)
const RESEND_COOLDOWN_MS = 60 * 1000 // 1 minute

// Cookie configuration helper
const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  maxAge,
  path: "/",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
})

// --- User Registration ---
export const registerUser = asyncHandler(async (req, res) => {
  const { email, password, username, fullname, avatar, role } = req.body

  if (!email || !password || !username || !fullname) {
    throw new ApiError(400, "Username, fullname, email, and password are required")
  }

  // --- Step 1: Check email and username conflicts SEPARATELY ---
  // Using $or in one query can mask which field caused the conflict
  // and creates ambiguity when two different users match on different fields.
  const [emailConflict, usernameConflict] = await Promise.all([
    User.findOne({ email }),
    User.findOne({ username }),
  ])

  // --- Step 2: Verified conflicts are hard stops ---
  if (emailConflict?.isEmailVerified) {
    throw new ApiError(409, "An account with this email already exists")
  }
  if (usernameConflict?.isEmailVerified) {
    throw new ApiError(409, "This username is already taken")
  }

  // --- Step 3: Unverified username conflict ---
  // The username is taken by a different unverified user.
  // We don't let the new registrant steal it — they should pick another.
  // Exception: if emailConflict and usernameConflict point to the SAME user,
  // it's the same person re-registering — that case is handled below.
  const isSameUnverifiedUser =
    emailConflict &&
    usernameConflict &&
    emailConflict._id.equals(usernameConflict._id)

  if (usernameConflict && !isSameUnverifiedUser) {
    // Username taken by a different unverified user
    throw new ApiError(409, "This username is already taken")
  }

  // --- Step 4: Unverified email conflict — resend flow ---
  // At this point emailConflict (if any) is unverified, and either:
  //   a) no username conflict, or
  //   b) username conflict is the same user (same person re-registering)
  if (emailConflict && !emailConflict.isEmailVerified) {
    // Cooldown check — prevent email spam if a valid token was recently issued
    const tokenIssuedAt = emailConflict.emailVerificationExpiry
      ? emailConflict.emailVerificationExpiry - ms(process.env.EMAIL_VERIFICATION_EXPIRY || "24h")
      : null
    const cooldownActive =
      tokenIssuedAt && Date.now() - tokenIssuedAt < RESEND_COOLDOWN_MS

    if (cooldownActive) {
      const secondsLeft = Math.ceil(
        (RESEND_COOLDOWN_MS - (Date.now() - tokenIssuedAt)) / 1000,
      )
      throw new ApiError(
        429,
        `Please wait ${secondsLeft} seconds before requesting another verification email`,
      )
    }

    // Update registration data in case the user is correcting it
    emailConflict.fullname = fullname
    emailConflict.password = password // pre-save hook will re-hash

    // Only update username if it's actually changing AND not conflicting
    if (username !== emailConflict.username) {
      // We already checked usernameConflict above, so this is safe
      emailConflict.username = username
    }

    // Only update avatar if a new one is explicitly provided
    if (avatar) {
      emailConflict.avatar = avatar
    }

    // Role updates on re-register are ignored for security —
    // role should only be set on initial creation or by an admin
    // (remove this line if your app allows role selection at register time)
    // emailConflict.role = role

    // Regenerate verification token
    const { unHashedToken, hashToken, tokenExpiry } =
      await emailConflict.generateTemporaryToken()
    emailConflict.emailVerificationToken = hashToken
    emailConflict.emailVerificationExpiry = tokenExpiry

    await emailConflict.save({ validateBeforeSave: false })

    const verificationUrl = `${process.env.CORS_ORIGIN}/verify/${unHashedToken}`
    const mailgenContent = reEmailVerificationMailGenContent(
      emailConflict.username,
      verificationUrl,
    )
console.log(`\n 🔗 DEV VERIFICATION LINK: ${verificationUrl} \n`);
    try {
      await sendMail({
        email: emailConflict.email,
        mailgenContent,
        subject: "Verify Your Email Address",
      })
    } catch (emailError) {
      console.warn("⚠️ Verification email failed to send:", emailError.message)
      // Don't fail the request — user can use resend endpoint
    }

    const updatedUser = await User.findById(emailConflict._id).select(
      "-password -emailVerificationToken",
    )

    return res.status(200).json(
      new ApiResponse(
        200,
        updatedUser,
        "A verification email has been resent. Please check your inbox.",
      ),
    )
  }

  // --- Step 5: Fresh registration ---
  const user = await User.create({
    avatar: avatar || undefined,
    email,
    fullname,
    password,
    role,
    username,
  })

  if (!user) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  const { unHashedToken, hashToken, tokenExpiry } = await user.generateTemporaryToken()
  user.emailVerificationToken = hashToken
  user.emailVerificationExpiry = tokenExpiry
  await user.save({ validateBeforeSave: false })

  const verificationUrl = `${process.env.CORS_ORIGIN}/verify/${unHashedToken}`
  const mailgenContent = emailVerificationMailGenContent(user.username, verificationUrl)

  console.log(`\n 🔗 DEV VERIFICATION LINK: ${verificationUrl} \n`);

  try {
    await sendMail({
      email: user.email,
      mailgenContent,
      subject: "Verify Your Email Address",
    })
  } catch (emailError) {
    console.warn("⚠️ Verification email failed to send:", emailError.message)
    // Non-blocking — user can resend via /resend-verify endpoint
  }

  const createdUser = await User.findById(user._id).select(
    "-password -emailVerificationToken",
  )

  await logAudit({
    actor: createdUser,
    category: "auth",
    description: `User ${createdUser.username} registered`,
    event: "user.register",
    ipAddress: req.ip,
    metadata: { email: createdUser.email, role: createdUser.role },
    targetId: createdUser._id,
    userAgent: req.headers["user-agent"],
  })

  return res.status(201).json(
    new ApiResponse(
      201,
      createdUser,
      "Registered successfully. Please check your email to verify your account.",
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

  // Guard: already verified (e.g. token used twice)
  if (user.isEmailVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Email is already verified. You can log in."))
  }

  user.isEmailVerified = true
  user.emailVerificationToken = undefined
  user.emailVerificationExpiry = undefined
  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Email verified successfully. You can now log in."))
})

// --- Resend Verification Email ---
export const resendVerifyEmail = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(404, "No account found with this email")
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "This email is already verified")
  }

  // Cooldown check
  const tokenIssuedAt = user.emailVerificationExpiry
    ? user.emailVerificationExpiry - ms(process.env.EMAIL_VERIFICATION_EXPIRY || "24h")
    : null
  const cooldownActive = tokenIssuedAt && Date.now() - tokenIssuedAt < RESEND_COOLDOWN_MS

  if (cooldownActive) {
    const secondsLeft = Math.ceil(
      (RESEND_COOLDOWN_MS - (Date.now() - tokenIssuedAt)) / 1000,
    )
    throw new ApiError(
      429,
      `Please wait ${secondsLeft} seconds before requesting another verification email`,
    )
  }

  const { unHashedToken, hashToken, tokenExpiry } = await user.generateTemporaryToken()
  user.emailVerificationToken = hashToken
  user.emailVerificationExpiry = tokenExpiry
  await user.save({ validateBeforeSave: false })

  const verificationUrl = `${process.env.CORS_ORIGIN}/verify/${unHashedToken}`
  const mailgenContent = reEmailVerificationMailGenContent(user.username, verificationUrl)

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
    throw new ApiError(404, "No account found. Please register first to create an account.")
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

  await RefreshToken.create({
    deviceInfo: req.headers["user-agent"] || "unknown",
    expiresAt: new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRY)),
    token: refreshToken,
    user: user._id,
  })

  const loggedInUser = await User.findById(user._id).select("-password")

  await logAudit({
    actor: user,
    category: "auth",
    description: `User ${user.username} logged in`,
    event: "login.success",
    ipAddress: req.ip,
    targetId: user._id,
    userAgent: req.headers["user-agent"],
  })

  const accessTokenOptions = getCookieOptions(ms(process.env.ACCESS_TOKEN_EXPIRY))
  const refreshTokenOptions = getCookieOptions(ms(process.env.REFRESH_TOKEN_EXPIRY))

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken, user: loggedInUser },
        "User logged in successfully",
      ),
    )
})

// --- User Logout ---
export const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies

  if (refreshToken) {
    try {
      await RefreshToken.deleteOne({ token: refreshToken })
      await BlacklistedToken.create({
        expiresAt: new Date(Date.now() + ms(process.env.BLACKLISTED_TOKEN_EXPIRY)),
        token: refreshToken,
        user: req.user._id,
      })
    } catch (error) {
      console.error("Error invalidating refresh token:", error)
    }
  }

  const clearCookieOptions = {
    httpOnly: true,
    path: "/",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  }

  return res
    .status(200)
    .clearCookie("accessToken", clearCookieOptions)
    .clearCookie("refreshToken", clearCookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})

// --- Refresh Access Token ---
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is missing")
  }

  const oldTokenDoc = await RefreshToken.findOneAndDelete({
    token: incomingRefreshToken,
  })

  if (!oldTokenDoc || oldTokenDoc.expiresAt < new Date()) {
    throw new ApiError(401, "Invalid or expired refresh token")
  }

  const user = await User.findById(oldTokenDoc.user)
  if (!user) {
    throw new ApiError(401, "Account not found. Please log in again.")
  }

  const newAccessToken = await user.generateAccessToken()
  const newRefreshToken = await user.generateRefreshToken()

  await RefreshToken.create({
    deviceInfo: req.headers["user-agent"] || "unknown",
    expiresAt: new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRY)),
    ipAddress: req.ip || "unknown",
    token: newRefreshToken,
    user: user._id,
  })

  const accessTokenOptions = getCookieOptions(ms(process.env.ACCESS_TOKEN_EXPIRY))
  const refreshTokenOptions = getCookieOptions(ms(process.env.REFRESH_TOKEN_EXPIRY))

  return res
    .status(200)
    .cookie("accessToken", newAccessToken, accessTokenOptions)
    .cookie("refreshToken", newRefreshToken, refreshTokenOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken: newAccessToken, refreshToken: newRefreshToken },
        "Tokens refreshed successfully",
      ),
    )
})

// --- Password Management ---
export const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  const user = await User.findOne({ email })

  // Always return the same generic message to prevent email enumeration
  const genericResponse = res.status(200).json(
    new ApiResponse(
      200,
      {},
      "If an account with that email exists, you will receive password reset instructions.",
    ),
  )

  if (!user) return genericResponse

  // Only allow password reset for verified accounts
  if (!user.isEmailVerified) return genericResponse

  const { unHashedToken, hashToken, tokenExpiry } = await user.generateTemporaryToken()
  user.forgotPasswordToken = hashToken
  user.forgotPasswordExpiry = tokenExpiry
  await user.save({ validateBeforeSave: false })

  const resetUrl = `${process.env.CORS_ORIGIN}/reset-password/${unHashedToken}`
  const mailgenContent = forgotPasswordMailgenContent(user.username, resetUrl)

  try {
    await sendMail({
      email: user.email,
      mailgenContent,
      subject: "Password Reset Request",
    })
  } catch (emailError) {
    console.warn("⚠️ Password reset email failed to send:", emailError.message)
  }

  return genericResponse
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

  // Invalidate all existing refresh tokens on password reset (security)
  await RefreshToken.deleteMany({ user: user._id })

  await user.save()

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password has been reset successfully."))
})

// --- User Profile ---
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password")
  if (!user) {
    throw new ApiError(404, "Account not found. Please log in again.")
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"))
})

export const getActiveSession = asyncHandler(async (req, res) => {
  const activeSessions = await RefreshToken.find({ user: req.user._id })
  return res.status(200).json(
    new ApiResponse(
      200,
      { count: activeSessions.length, sessions: activeSessions },
      "Active sessions fetched successfully",
    ),
  )
})

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const {
    fullname,
    phone,
    bio,
    location,
    company,
    jobTitle,
    website,
    linkedin,
    github,
    theme,
    notifications,
  } = req.body

  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError(404, "Account not found")
  }

  if (fullname !== undefined) user.fullname = fullname
  if (phone !== undefined) user.phone = phone
  if (bio !== undefined) user.bio = bio
  if (location !== undefined) user.location = location
  if (company !== undefined) user.company = company
  if (jobTitle !== undefined) user.jobTitle = jobTitle
  if (website !== undefined) user.website = website
  if (linkedin !== undefined) user.linkedin = linkedin
  if (github !== undefined) user.github = github
  if (theme !== undefined) user.theme = theme
  if (notifications !== undefined) user.notifications = notifications

  await user.save()

  const updatedUser = await User.findById(userId).select("-password")

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"))
})

export const deleteUserAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError(404, "Account not found")
  }

  await logAudit({
    actor: user,
    category: "user",
    description: `User ${user.username} deleted their account`,
    event: "user.delete",
    ipAddress: req.ip,
    targetId: user._id,
    userAgent: req.headers["user-agent"],
  })

  // Clean up sessions on account deletion
  await RefreshToken.deleteMany({ user: userId })

  await User.findByIdAndDelete(userId)

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Account deleted successfully"))
})

export const updateUserAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Avatar image file is required")
  }

  try {
    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: "avatars/",
    })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { "avatar.url": result.url } },
      { new: true, runValidators: true },
    ).select("-password")

    if (!user) {
      throw new ApiError(404, "Account not found")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Avatar updated successfully"))
  } catch (error) {
    console.error("ImageKit Upload Error:", error)
    throw new ApiError(500, "Failed to upload avatar due to a server error.")
  }
})

// --- Admin: Update User Role ---
export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const { role } = req.body

  if (!userId) {
    throw new ApiError(400, "User ID is required")
  }

  if (!role || !["admin", "member"].includes(role)) {
    throw new ApiError(400, "Role must be either 'admin' or 'member'")
  }

  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError(404, "Account not found")
  }

  const oldRole = user.role // capture before mutation
  user.role = role
  await user.save({ validateBeforeSave: false })

  const updatedUser = await User.findById(userId).select("-password")

  await logAudit({
    actor: req.user,
    category: "admin",
    description: `Admin ${req.user.username} changed ${user.username} role to ${role}`,
    event: "admin.role.change",
    ipAddress: req.ip,
    metadata: { newRole: role, oldRole }, // fix: was using mutated user.role
    targetId: user._id,
    userAgent: req.headers["user-agent"],
  })

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User role updated successfully"))
})