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

const RESEND_COOLDOWN_MS = ms(process.env.RESEND_COOLDOWN || "60s")
const EMAIL_VERIFICATION_EXPIRY_MS = ms(process.env.TEMPORARY_TOKEN_EXPIRY || "1h")

const getCookieOptions = (maxAge) => ({
	httpOnly: true,
	maxAge,
	path: "/",
	sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
	secure: process.env.NODE_ENV === "production",
})

const CLEAR_COOKIE_OPTIONS = {
	httpOnly: true,
	path: "/",
	sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
	secure: process.env.NODE_ENV === "production",
}

/**
 * Calculate when the verification token was originally issued.
 */
const getTokenIssuedAt = (expiryDate) =>
	expiryDate ? expiryDate - EMAIL_VERIFICATION_EXPIRY_MS : null

/**
 * Check if the resend cooldown is still active and throw if so.
 */
const enforceResendCooldown = (tokenIssuedAt) => {
	if (!tokenIssuedAt) return
	const elapsed = Date.now() - tokenIssuedAt
	if (elapsed < RESEND_COOLDOWN_MS) {
		const secondsLeft = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000)
		throw new ApiError(429, `Please wait ${secondsLeft} seconds before requesting another email`)
	}
}

// --- User Registration ---
export const registerUser = asyncHandler(async (req, res) => {
	const { email, password, username, fullname, avatar } = req.body

	if (!email || !password || !username || !fullname) {
		throw new ApiError(400, "Username, fullname, email, and password are required")
	}

	const [emailConflict, usernameConflict] = await Promise.all([
		User.findOne({ email }),
		User.findOne({ username }),
	])

	if (emailConflict?.isEmailVerified) {
		throw new ApiError(409, "An account with this email already exists")
	}
	if (usernameConflict?.isEmailVerified) {
		throw new ApiError(409, "This username is already taken")
	}

	// Handle unverified email conflict safely (no data overwrite)
	if (emailConflict && !emailConflict.isEmailVerified) {
		const tokenIssuedAt = getTokenIssuedAt(emailConflict.emailVerificationExpiry)
		enforceResendCooldown(tokenIssuedAt)

		// Regenerate verification token WITHOUT overwriting user password/data
		const { unHashedToken, hashToken, tokenExpiry } = await emailConflict.generateTemporaryToken()
		emailConflict.emailVerificationToken = hashToken
		emailConflict.emailVerificationExpiry = tokenExpiry

		await emailConflict.save()

		const verificationUrl = `${process.env.CORS_ORIGIN}/verify/${unHashedToken}`
		const mailgenContent = reEmailVerificationMailGenContent(
			emailConflict.username,
			verificationUrl,
		)

		try {
			await sendMail({
				email: emailConflict.email,
				mailgenContent,
				subject: "Verify Your Email Address",
			})
		} catch (emailError) {
			console.warn("⚠️ Verification email failed to send:", emailError.message)
		}

		return res
			.status(200)
			.json(
				new ApiResponse(
					200,
					null,
					"Account exists but is unverified. A new verification email has been sent.",
				),
			)
	}

	// Ensure unverified usernames aren't hijacked
	if (usernameConflict) {
		throw new ApiError(
			409,
			"This username is currently pending verification by another user. Please choose another.",
		)
	}

	// Fresh registration
	let user
	try {
		user = await User.create({
			avatar: avatar || undefined,
			email,
			fullname,
			password,
			username,
		})
	} catch (err) {
		if (err.code === 11000) {
			throw new ApiError(409, "Account already exists")
		}
		throw err
	}

	if (!user) {
		throw new ApiError(500, "Something went wrong while registering the user")
	}

	const { unHashedToken, hashToken, tokenExpiry } = await user.generateTemporaryToken()
	user.emailVerificationToken = hashToken
	user.emailVerificationExpiry = tokenExpiry

	await user.save()

	const verificationUrl = `${process.env.CORS_ORIGIN}/verify/${unHashedToken}`
	const mailgenContent = emailVerificationMailGenContent(user.username, verificationUrl)

	if (process.env.NODE_ENV !== "production") {
		console.log(`\n 🔗 DEV VERIFICATION LINK: ${verificationUrl} \n`)
	}

	try {
		await sendMail({
			email: user.email,
			mailgenContent,
			subject: "Verify Your Email Address",
		})
	} catch (emailError) {
		console.warn("⚠️ Verification email failed to send:", emailError.message)
	}

	const createdUser = await User.findById(user._id).select("-password -emailVerificationToken")

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

	return res
		.status(201)
		.json(
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
	if (!pepper) throw new ApiError(500, "Server configuration error")

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

	if (user.isEmailVerified) {
		return res
			.status(200)
			.json(new ApiResponse(200, {}, "Email is already verified. You can log in."))
	}

	user.isEmailVerified = true
	user.emailVerificationToken = undefined
	user.emailVerificationExpiry = undefined

	await user.save()

	return res
		.status(200)
		.json(new ApiResponse(200, { user }, "Email verified successfully. You can now log in."))
})

// --- Resend Verification Email ---
export const resendVerifyEmail = asyncHandler(async (req, res) => {
	const { email } = req.body
	if (!email) throw new ApiError(400, "Email is required")

	const user = await User.findOne({ email })
	if (!user) throw new ApiError(404, "No account found with this email")
	if (user.isEmailVerified) throw new ApiError(400, "This email is already verified")

	const tokenIssuedAt = getTokenIssuedAt(user.emailVerificationExpiry)
	enforceResendCooldown(tokenIssuedAt)

	const { unHashedToken, hashToken, tokenExpiry } = await user.generateTemporaryToken()
	user.emailVerificationToken = hashToken
	user.emailVerificationExpiry = tokenExpiry
	await user.save()

	const verificationUrl = `${process.env.CORS_ORIGIN}/verify/${unHashedToken}`
	const mailgenContent = reEmailVerificationMailGenContent(user.username, verificationUrl)

	try {
		await sendMail({
			email: user.email,
			mailgenContent,
			subject: "Resend Email Verification",
		})
	} catch (emailError) {
		console.warn("⚠️ Verification email failed to send:", emailError.message)
	}

	return res.status(200).json(new ApiResponse(200, {}, "Verification email sent successfully"))
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

	// Return 401 (not 404) to obscure whether an account exists
	if (!user) {
		throw new ApiError(401, "Invalid credentials")
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
		.json(new ApiResponse(200, { user: loggedInUser }, "User logged in successfully"))
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

	return res
		.status(200)
		.clearCookie("accessToken", CLEAR_COOKIE_OPTIONS)
		.clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS)
		.json(new ApiResponse(200, {}, "User logged out successfully"))
})

// --- Refresh Access Token ---
export const refreshAccessToken = asyncHandler(async (req, res) => {
	const incomingRefreshToken = req.cookies.refreshToken
	if (!incomingRefreshToken) throw new ApiError(401, "Refresh token is missing")

	// Check if token has been blacklisted (e.g., from logout or password reset)
	const isBlacklisted = await BlacklistedToken.findOne({ token: incomingRefreshToken })
	if (isBlacklisted) {
		throw new ApiError(401, "Token has been invalidated. Please login again.")
	}

	const oldTokenDoc = await RefreshToken.findOneAndDelete({ token: incomingRefreshToken })

	if (!oldTokenDoc || oldTokenDoc.expiresAt < new Date()) {
		throw new ApiError(401, "Invalid or expired refresh token")
	}

	const user = await User.findById(oldTokenDoc.user)
	if (!user) throw new ApiError(401, "Account not found. Please log in again.")

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
		.json(new ApiResponse(200, { accessToken: newAccessToken, refreshToken: newRefreshToken }, "Tokens refreshed"))
})

// --- Password Management ---
export const forgetPassword = asyncHandler(async (req, res) => {
	const { email } = req.body
	if (!email) throw new ApiError(400, "Email is required")

	const user = await User.findOne({ email })

	// Always return the same generic message to prevent email enumeration
	const genericMessage =
		"If an account with that email exists, you will receive password reset instructions."

	if (!user || !user.isEmailVerified) {
		return res.status(200).json(new ApiResponse(200, {}, genericMessage))
	}

	const { unHashedToken, hashToken, tokenExpiry } = await user.generateTemporaryToken()
	user.forgotPasswordToken = hashToken
	user.forgotPasswordExpiry = tokenExpiry
	await user.save()

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

	return res.status(200).json(new ApiResponse(200, {}, genericMessage))
})

export const resetPassword = asyncHandler(async (req, res) => {
	const { token } = req.params
	const { password } = req.body

	if (!token || !password) {
		throw new ApiError(400, "Token and new password are required")
	}

	const pepper = process.env.HASH_PEPPER
	if (!pepper) {
		throw new ApiError(500, "Server configuration error")
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
	user.passwordChangedAt = Date.now()
	user.forgotPasswordToken = undefined
	user.forgotPasswordExpiry = undefined

	await RefreshToken.deleteMany({ user: user._id })
	await user.save()

	return res.status(200).json(new ApiResponse(200, {}, "Password has been reset successfully."))
})

// --- User Profile ---
export const getUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id).select("-password")
	if (!user) throw new ApiError(404, "Account not found. Please log in again.")
	return res.status(200).json(new ApiResponse(200, user, "User profile fetched successfully"))
})

export const getActiveSession = asyncHandler(async (req, res) => {
	const activeSessions = await RefreshToken.find({ user: req.user._id })
		.select("-token -__v")
		.lean()

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				{ count: activeSessions.length, sessions: activeSessions },
				"Active sessions fetched",
			),
		)
})

export const updateProfile = asyncHandler(async (req, res) => {
	const userId = req.user._id
	const allowedUpdates = [
		"fullname",
		"phone",
		"bio",
		"location",
		"company",
		"jobTitle",
		"website",
		"linkedin",
		"github",
		"theme",
		"notifications",
	]

	const user = await User.findById(userId)
	if (!user) throw new ApiError(404, "Account not found")

	const changedFields = []
	for (const field of allowedUpdates) {
		if (req.body[field] !== undefined) {
			user[field] = req.body[field]
			changedFields.push(field)
		}
	}

	await user.save()
	const updatedUser = await User.findById(userId).select("-password")

	if (changedFields.length > 0) {
		const sensitiveFields = ["phone", "linkedin"]
		const hasSensitiveChange = changedFields.some((f) => sensitiveFields.includes(f))

		await logAudit({
			actor: user,
			category: "user",
			description: `User ${user.username} updated profile fields: ${changedFields.join(", ")}`,
			event: "user.profile.update",
			ipAddress: req.ip,
			metadata: hasSensitiveChange
				? { changedFields, sensitiveFieldsChanged: true }
				: { changedFields },
			targetId: user._id,
			userAgent: req.headers["user-agent"],
		})
	}

	return res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated successfully"))
})

export const deleteUserAccount = asyncHandler(async (req, res) => {
	const userId = req.user._id
	const user = await User.findById(userId)
	if (!user) throw new ApiError(404, "Account not found")

	await logAudit({
		actor: user,
		category: "user",
		description: `User ${user.username} deleted their account`,
		event: "user.delete",
		ipAddress: req.ip,
		targetId: user._id,
		userAgent: req.headers["user-agent"],
	})

	await RefreshToken.deleteMany({ user: userId })
	await User.findByIdAndDelete(userId)

	return res.status(200).json(new ApiResponse(200, null, "Account deleted successfully"))
})

export const updateUserAvatar = asyncHandler(async (req, res) => {
	if (!req.file) throw new ApiError(400, "Avatar image file is required")

	// File size limit: 5MB
	if (req.file.size > 5 * 1024 * 1024) {
		throw new ApiError(400, "Avatar must be under 5MB")
	}

	// Strict MIME type validation
	const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"]
	if (!allowedMimeTypes.includes(req.file.mimetype)) {
		throw new ApiError(400, "Invalid file type. Only JPEG, PNG, and WebP are allowed.")
	}

	try {
		const fileBase64 = req.file.buffer.toString("base64")
		const dataUri = `data:${req.file.mimetype};base64,${fileBase64}`

		const result = await imagekit.upload({
			file: dataUri,
			fileName: req.file.originalname,
			folder: "/avatars",
			useUniqueFileName: true,
		})

		const user = await User.findByIdAndUpdate(
			req.user._id,
			{ $set: { "avatar.url": result.url } },
			{ new: true, runValidators: true },
		).select("-password")

		if (!user) throw new ApiError(404, "Account not found")

		return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"))
	} catch (error) {
		console.error("ImageKit Upload Error:", error.message)
		throw new ApiError(500, `Failed to upload avatar: ${error.message}`)
	}
})

// --- Admin: Update User Role ---
export const updateUserRole = asyncHandler(async (req, res) => {
	const { userId } = req.params
	const { role } = req.body

	if (!userId) throw new ApiError(400, "User ID is required")
	if (!role || !["admin", "member"].includes(role)) {
		throw new ApiError(400, "Role must be either 'admin' or 'member'")
	}

	const user = await User.findById(userId)
	if (!user) throw new ApiError(404, "Account not found")

	const oldRole = user.role
	user.role = role
	await user.save({ validateBeforeSave: false })

	const updatedUser = await User.findById(userId).select("-password")

	await logAudit({
		actor: req.user,
		category: "role",
		description: `Admin ${req.user.username} changed ${user.username} role to ${role}`,
		event: "admin.role.change",
		ipAddress: req.ip,
		metadata: { newRole: role, oldRole },
		targetId: user._id,
		userAgent: req.headers["user-agent"],
	})

	return res.status(200).json(new ApiResponse(200, updatedUser, "User role updated successfully"))
})
