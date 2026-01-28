import { Router } from "express"
import {
  forgetPassword,
  getActiveSession,
  getUserProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendVerifyEmail,
  resetPassword,
  updateUserAvatar,
  verifyUser,
} from "../controllers/auth.controller.js"
import { protect } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import validator from "../middlewares/validator.middleware.js"
import { asyncHandler } from "../utils/async-handler.js"
import {
  userForgotPasswordValidator,
  userLoginValidator,
  userRegistrationValidator,
  userResetPasswordValidator,
} from "../validators/auth.validator.js"

const router = Router()

router.route("/register").post(
  userRegistrationValidator(),
  validator,
  asyncHandler(async (req, res, next) => {
    return registerUser(req, res, next)
  }),
)
// when anyone comes to this "register route" that directly execute "userRegistrationValidator" and
// if get validation "error" inside the "userRegistrationValidator" it "passed to validator" it will throw error

router.route("/verify/:token").get(asyncHandler(verifyUser))
router.route("/resend-verify-email").post(asyncHandler(resendVerifyEmail))

router.route("/login").post(validator, asyncHandler(loginUser))

router.route("/logout").post(protect, asyncHandler(logoutUser))

router.route("/refresh-token").post(protect, asyncHandler(refreshAccessToken))

router
  .route("/forget-password")
  .post(userForgotPasswordValidator(), validator, asyncHandler(forgetPassword))
router
  .route("/reset-password/:token")
  .post(userResetPasswordValidator(), validator, asyncHandler(resetPassword))

//Protected Routes
router.get("/me", protect, asyncHandler(getUserProfile))

router.get("/get-active-sessions", protect, asyncHandler(getActiveSession))

router.put("/update-avatar", protect, upload.single("avatars"), asyncHandler(updateUserAvatar))
// In your auth routes
router.get("/debug-cookies", (req, res) => {
  res.json({
    cookies: req.cookies,
    headers: req.headers,
    origin: req.headers.origin,
  })
})

export default router
