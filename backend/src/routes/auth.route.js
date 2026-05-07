import { Router } from "express"
import {
	deleteUserAccount,
	forgetPassword,
	getActiveSession,
	getUserProfile,
	loginUser,
	logoutUser,
	refreshAccessToken,
	registerUser,
	resendVerifyEmail,
	resetPassword,
	updateProfile,
	updateUserAvatar,
	updateUserRole,
	verifyUser,
} from "../controllers/auth.controller.js"
import { protect, requireAdmin } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import { authLimiter } from "../middlewares/rateLimit.middleware.js"
import validator from "../middlewares/validator.middleware.js"
import { asyncHandler } from "../utils/async-handler.js"
import {
	userForgotPasswordValidator,
	userLoginValidator,
	userRegistrationValidator,
	userResetPasswordValidator,
} from "../validators/auth.validator.js"

const router = Router()

router
	.route("/register")
	.post(authLimiter, userRegistrationValidator(), validator, asyncHandler(registerUser))

// Email verification
router.route("/verify/:token").get(authLimiter, asyncHandler(verifyUser))
router
	.route("/verify-email")
	.post(authLimiter, userForgotPasswordValidator(), validator, asyncHandler(resendVerifyEmail))

router.route("/login").post(authLimiter, userLoginValidator(), validator, asyncHandler(loginUser))

router.route("/logout").post(protect, asyncHandler(logoutUser))

router.route("/refresh-token").post(asyncHandler(refreshAccessToken))

router
	.route("/forgot")
	.post(authLimiter, userForgotPasswordValidator(), validator, asyncHandler(forgetPassword))
router
	.route("/reset/:token")
	.post(authLimiter, userResetPasswordValidator(), validator, asyncHandler(resetPassword))

// Protected Routes
router.get("/me", protect, asyncHandler(getUserProfile))
router.get("/sessions", protect, asyncHandler(getActiveSession))
router.patch("/profile", protect, asyncHandler(updateProfile))
router.patch("/avatar", protect, upload.single("avatar"), asyncHandler(updateUserAvatar))
router.delete("/account", protect, asyncHandler(deleteUserAccount))

// Admin-only routes
router.patch("/users/:userId/role", protect, requireAdmin, asyncHandler(updateUserRole))

export default router
