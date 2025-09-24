import { Router } from "express";
import validator from "../middlewares/validator.middleware.js";
import {
  userForgotPasswordValidator,
  userLoginValidator,
  userRegistrationValidator,
  userResetPasswordValidator,
} from "../validators/auth.validator.js";
import {
  forgetPassword,
  loginUser,
  logoutUser,
  registerUser,
  verifyUser,
  resetPassword,
  resendVerifyEmail,
  refreshAccessToken,
  getUserProfile,
  getActiveSession,
} from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { protect } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  userRegistrationValidator(),
  validator,
  asyncHandler(async (req, res, next) => {
    return registerUser(req, res, next);
  })
);
// when anyone comes to this "register route" that directly execute "userRegistrationValidator" and
// if get validation "error" inside the "userRegistrationValidator" it "passed to validator" it will throw error

router.route("/verify/:token").get(asyncHandler(verifyUser));
router.route("/resend-verification").post(asyncHandler(resendVerifyEmail));

router.route("/login").post(validator, asyncHandler(loginUser));

router.route("/logout").post(asyncHandler(logoutUser));

router.route("/refresh-token").post(protect, asyncHandler(refreshAccessToken));

router
  .route("/forget-password")
  .post(userForgotPasswordValidator(), validator, asyncHandler(forgetPassword));
router
  .route("/reset-password/:token")
  .post(userResetPasswordValidator(), validator, asyncHandler(resetPassword));

//Protected Routes
router.get("/me", protect, asyncHandler(getUserProfile));

router.get("/get-active-sessions", protect, asyncHandler(getActiveSession));

export default router;
