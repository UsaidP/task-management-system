import { Router } from "express"
import { protect } from "../middlewares/auth.middleware.js"
import { asyncHandler } from "../utils/async-handler.js"
import { sendMail } from "../utils/mail.js"
import { emailVerificationMailGenContent } from "../utils/mail.js"
import ApiError from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"

const router = Router()

/**
 * Test email endpoint
 * Use this to verify your email configuration is working
 * 
 * Usage:
 * curl http://localhost:4000/api/v1/email/test \
 *   -H "Authorization: Bearer YOUR_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{"email": "test@example.com"}'
 */
router.post(
  "/test",
  protect,
  asyncHandler(async (req, res) => {
    const { email } = req.body

    if (!email) {
      throw new ApiError(400, "Email is required. Send: { email: 'test@example.com' }")
    }

    // Send test email
    const mailgenContent = {
      body: {
        name: req.user.fullname || "User",
        intro: [
          "This is a test email from TaskFlow!",
          "If you received this, your email configuration is working correctly.",
        ],
        table: {
          data: [
            {
              Test: "Email Configuration",
              Status: "✅ Passed",
            },
            {
              Provider: process.env.MAIL_HOST,
              Status: "✅ Working",
            },
          ],
        },
        action: {
          instructions: "Click below to visit TaskFlow:",
          button: {
            color: "#2563EB",
            link: process.env.BASE_URL || "http://localhost:5173",
            text: "Visit TaskFlow",
          },
        },
        outro: [
          "This email was sent to test the email configuration.",
          "If you didn't request this test, you can safely ignore it.",
        ],
      },
    }

    await sendMail({
      email,
      subject: "✅ TaskFlow Email Test Successful",
      mailgenContent,
    })

    res.json(
      new ApiResponse(
        200,
        {
          sentTo: email,
          provider: process.env.MAIL_HOST,
          from: process.env.EMAIL_FROM,
        },
        "Test email sent successfully! Check your inbox."
      )
    )
  })
)

/**
 * Send verification email test
 * Tests the actual verification email template
 */
router.post(
  "/test-verification",
  protect,
  asyncHandler(async (req, res) => {
    const { email } = req.body

    if (!email) {
      throw new ApiError(400, "Email is required")
    }

    const verificationUrl = process.env.BASE_URL || "http://localhost:5173"
    const mailgenContent = emailVerificationMailGenContent(
      req.user.fullname || "User",
      verificationUrl
    )

    await sendMail({
      email,
      subject: "🔐 TaskFlow Email Verification Test",
      mailgenContent,
    })

    res.json(
      new ApiResponse(
        200,
        {
          sentTo: email,
          template: "verification",
        },
        "Verification email sent successfully!"
      )
    )
  })
)

export default router
