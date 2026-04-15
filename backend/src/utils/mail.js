import Mailgen from "mailgen"
import nodemailer from "nodemailer"
import { Resend } from "resend"
import validator from "validator"
import ApiError from "./api-error.js"
import { ApiResponse } from "./api-response.js"

// -----------------------------------------------------------------------------
// 1. Initialize Mailgen once
// -----------------------------------------------------------------------------

const mailGenerator = new Mailgen({
  product: {
    copyright: `Copyright © ${new Date().getFullYear()} TaskFlow. All rights reserved.`,
    link: process.env.BASE_URL || "https://taskflow.com",
    logo: process.env.EMAIL_LOGO_URL || "https://placehold.co/200x50/C4654A/FAF6F1?text=TaskFlow",
    name: "TaskFlow",
  },
  theme: "cerberus",
  themeConfig: {
    backgroundColor: "#FAF6F1",
    bodyCell: { backgroundColor: "#FAF6F1", contentColor: "#2C2420" },
    contentCell: { backgroundColor: "#FAF6F1", contentColor: "#2C2420" },
    contentFont: "DM Sans, system-ui, -apple-system, sans-serif",
    primaryColor: "#C4654A",
    secondaryColor: "#5C4B3A",
    titleFont: "Lora, Georgia, serif",
  },
})

// -----------------------------------------------------------------------------
// 2. Email Provider Setup
// -----------------------------------------------------------------------------

let transporter = null
let resendClient = null
let emailProvider = null
let initPromise = null

const initEmailProvider = () => {
  if (initPromise) return initPromise

  initPromise = (async () => {
    if (process.env.RESEND_API_KEY) {
      resendClient = new Resend(process.env.RESEND_API_KEY)
      emailProvider = "resend"
      console.log("📧 Email provider: Resend API")
      return emailProvider
    }

    const mailPort = parseInt(process.env.MAIL_PORT, 10) || 587
    transporter = nodemailer.createTransport({
      auth: { pass: process.env.MAIL_PASS, user: process.env.MAIL_USER },
      host: process.env.MAIL_HOST,
      maxConnections: 5,
      maxMessages: 100,
      pool: true,
      port: mailPort,
      secure: mailPort === 465,
      tls: { rejectUnauthorized: process.env.NODE_ENV === "production" },
    })
    emailProvider = "smtp"
    console.log("📧 Email provider: SMTP")

    if (process.env.NODE_ENV !== "test") {
      console.log("🔌 Verifying SMTP connection...")
      try {
        await transporter.verify()
        console.log("✅ SMTP Connected — Emails are ready to send")
      } catch (error) {
        console.error("❌ SMTP Connection Failed:", error.message)
        // We do not throw here to allow subsequent sendMail attempts to happen,
        // since SMTP availability could recover.
      }
    }

    return emailProvider
  })()

  return initPromise
}

const getTransporter = async () => {
  await initEmailProvider()
  if (!transporter) throw new Error("SMTP transporter not initialized.")
  return transporter
}

const getResendClient = async () => {
  await initEmailProvider()
  if (!resendClient) throw new Error("Resend client not initialized.")
  return resendClient
}

// -----------------------------------------------------------------------------
// 3. Main Email Function
// -----------------------------------------------------------------------------

/**
 * Sends an email using the configured provider (Resend or SMTP).
 *
 * @param {object} options
 * @param {string} options.email           - Recipient email address
 * @param {string} options.subject         - Email subject line
 * @param {object} options.mailgenContent  - Mailgen content object
 *
 * @returns {Promise<ApiResponse>}
 * @throws  {ApiError}
 */
const sendMail = async (options) => {
  if (!options.email || !validator.isEmail(options.email)) {
    throw new ApiError(400, "Invalid recipient email address")
  }
  if (!options.subject) throw new ApiError(400, "Email subject is required")
  if (!options.mailgenContent) throw new ApiError(400, "Email content is required")

  // Sanitize subject to prevent header injection
  const safeSubject = options.subject.replace(/[\r\n]/g, " ")

  const emailPlainText = mailGenerator.generatePlaintext(options.mailgenContent)
  const emailHTML = mailGenerator.generate(options.mailgenContent)

  const fromAddress =
    process.env.RESEND_FROM ||
    process.env.EMAIL_FROM ||
    process.env.MAIL_FROM ||
    "noreply@taskflow.com"

  try {
    await initEmailProvider()

    if (emailProvider === "resend") {
      const client = await getResendClient()
      const { data, error } = await client.emails.send({
        from: `TaskFlow <${fromAddress}>`,
        html: emailHTML,
        subject: safeSubject,
        text: emailPlainText,
        to: [options.email],
      })

      if (error) {
        console.error("❌ Resend API error:", error.message)
        throw new ApiError(500, "Failed to send email. Please try again later.")
      }

      console.log("✅ Email sent via Resend:", { emailId: data?.id, to: options.email })
    } else {
      const transp = await getTransporter()
      const info = await transp.sendMail({
        from: `"TaskFlow" <${fromAddress}>`,
        headers: { "X-Mailer": "TaskFlow", "X-Priority": "3" },
        html: emailHTML,
        subject: safeSubject,
        text: emailPlainText,
        to: options.email,
      })

      console.log("✅ Email sent via SMTP:", { messageId: info.messageId, to: options.email })
    }

    return new ApiResponse(200, "Email sent successfully")
  } catch (err) {
    if (err instanceof ApiError) throw err
    console.error("❌ Email send error:", err.message)
    throw new ApiError(500, "Failed to send email. Please try again later.")
  }
}

// -----------------------------------------------------------------------------
// 4. Email Templates
// -----------------------------------------------------------------------------

/**
 * Helper to construct a definitive frontend link, whether the caller gave a 
 * complete URL or just a token. Prevents duplicate base URLs.
 */
const buildSafeUrl = (urlOrToken, path) => {
  if (!urlOrToken) return ""

  // If the argument is already a fully valid URL starting with http, return it untouched
  if (urlOrToken.startsWith("http://") || urlOrToken.startsWith("https://")) {
    return urlOrToken
  }

  // Otherwise, assume it's just a token and construct using environment fallback URL
  const baseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || "http://localhost:5173"

  // Normalize path formatting
  const cleanBaseUrl = baseUrl.replace(/\/$/, "")
  const cleanPath = path.replace(/^\//, "")

  // Format matches App.jsx react-router routes: /verify/:token and /reset-password/:token
  return `${cleanBaseUrl}/${cleanPath}/${urlOrToken}`
}

const emailVerificationMailGenContent = (username, verificationTokenOrUrl) => ({
  body: {
    action: {
      button: {
        color: "#C4654A",
        link: buildSafeUrl(verificationTokenOrUrl, "verify"),
        text: "Verify Your Email"
      },
      instructions: "Click the button below to verify your email and get started:",
    },
    greeting: `Welcome to TaskFlow, ${username}!`,
    intro: ["We're excited to have you on board. Please verify your email address to unlock all features:"],
    outro: [
      "Need help? Just reply to this email — we'd love to help.",
      "If you didn't create this account, you can safely ignore this email.",
    ],
    signature: false,
  },
})

const reEmailVerificationMailGenContent = (username, verificationTokenOrUrl) => ({
  body: {
    action: {
      button: {
        color: "#C4654A",
        link: buildSafeUrl(verificationTokenOrUrl, "verify"),
        text: "Verify Your Email"
      },
      instructions: "Click below to verify your email and unlock all features:",
    },
    greeting: `Hey ${username},`,
    intro: ["We noticed your email is still unverified. Verify it to access all TaskFlow features:"],
    outro: ["This verification link will expire in 24 hours."],
    signature: false,
  },
})

const forgotPasswordMailgenContent = (username, resetTokenOrUrl) => ({
  body: {
    action: {
      button: {
        color: "#C44A4A",
        link: buildSafeUrl(resetTokenOrUrl, "reset-password"),
        text: "Reset Your Password"
      },
      instructions: "Click the button below to reset your password:",
    },
    greeting: `Hey ${username},`,
    intro: ["We received a request to reset your TaskFlow password."],
    outro: [
      "This link will expire in 1 hour for security reasons.",
      "If you didn't request this, you can safely ignore this email — your password will remain unchanged.",
    ],
    signature: false,
  },
})

const taskAssignmentMailgenContent = (username, taskTitle, taskUrl, assignedBy) => ({
  body: {
    action: {
      button: { color: "#C4654A", link: taskUrl, text: "View Task" },
      instructions: "Click below to view the task details:",
    },
    greeting: `Hey ${username},`,
    intro: [`You've been assigned a new task by ${assignedBy}:`],
    outro: ["Good luck! Let us know if you need any help."],
    signature: false,
    table: {
      columns: { customWidth: { Status: "40%", Task: "60%" } },
      data: [{ Status: "Pending", Task: taskTitle }],
    },
  },
})

const taskDueSoonMailgenContent = (username, taskTitle, dueDate, taskUrl) => ({
  body: {
    action: {
      button: { color: "#D4A548", link: taskUrl, text: "View Task" },
      instructions: "Click below to view and complete the task:",
    },
    greeting: `Hey ${username},`,
    intro: ["This is a friendly reminder that a task is due soon:"],
    outro: ["Don't forget to mark the task as complete when you're done!"],
    signature: false,
    table: {
      data: [{ "Due Date": dueDate, Status: "In Progress", Task: taskTitle }],
    },
  },
})

const projectInvitationMailgenContent = (
  inviteeName,
  inviterName,
  projectName,
  role,
  inviteUrl,
  expiresInHours = 48,
) => ({
  body: {
    action: {
      button: { color: "#C4654A", link: inviteUrl, text: "Accept Invitation" },
      instructions: `Accept your invitation below. This link expires in ${expiresInHours} hours:`,
    },
    greeting: `Hey ${inviteeName},`,
    intro: [`${inviterName} has invited you to collaborate on **${projectName}** on TaskFlow.`],
    outro: [
      "If you don't have a TaskFlow account yet, you'll be prompted to create one.",
      "If you weren't expecting this invitation, you can safely ignore this email.",
    ],
    signature: false,
    table: {
      data: [
        { "": "Project", " ": projectName },
        { "": "Your Role", " ": role },
        { "": "Invited By", " ": inviterName },
      ],
    },
  },
})

export {
  sendMail,
  emailVerificationMailGenContent,
  reEmailVerificationMailGenContent,
  forgotPasswordMailgenContent,
  taskAssignmentMailgenContent,
  taskDueSoonMailgenContent,
  projectInvitationMailgenContent,
}
