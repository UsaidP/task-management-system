import { Router } from "express";
import validator from "../middlewares/validator.middleware.js";
import { userRegistrationValidator } from "../validators/auth.validator.js";
import {
  forgetPassword,
  loginUser,
  logoutUser,
  registerUser,
  verifyUser,
  resetPassword,
  resendVerifyEmail,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

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
router.route("/login").post(asyncHandler(loginUser));
router.route("/logout").get(asyncHandler(logoutUser));
router.route("/refresh-token").post(asyncHandler(refreshAccessToken));
router.route("/forget-password").post(asyncHandler(forgetPassword));
router.route("/reset-password/:token").post(asyncHandler(resetPassword));
export default router;
