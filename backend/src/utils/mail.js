import nodemailer from "nodemailer"
import Mailgen from "mailgen"
import validator from "validator"
import ApiError from "./api-error.js"
import { ApiResponse } from "./api-response.js"

// -----------------------------------------------------------------------------
// 1. Initialize Singletons (Runs ONCE when the server starts)
// -----------------------------------------------------------------------------

// Initialize Mailgen once
const mailGenerator = new Mailgen({
  product: {
    copyright: `Copyright © ${new Date().getFullYear()} TaskFlow. All rights reserved.`,
    link: process.env.BASE_URL || "https://taskflow.com",
    logo: process.env.EMAIL_LOGO_URL || "https://placehold.co/200x50/2563EB/FFFFFF?text=TaskFlow",
    name: "TaskFlow",
  },
  theme: "cerberus",
})

// Parse port properly to fix strict equality bug
const mailPort = parseInt(process.env.MAIL_PORT, 10) || 587

// Initialize SMTP Transporter once with Connection Pooling & Limits
const transporter = nodemailer.createTransport({
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  host: process.env.MAIL_HOST,
  port: mailPort,
  secure: mailPort === 465, // Fix: strict equality now compares numbers
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
})

// Verify SMTP connection on startup (defensively gated for hot-reloads)
let smtpVerified = false
if (process.env.NODE_ENV !== "test" && !smtpVerified) {
  transporter.verify((error) => {
    smtpVerified = true
    if (error) {
      console.warn("⚠️ SMTP Connection Error (Emails will not send):", error.message)
    } else {
      console.log("📧 SMTP Server Ready")
    }
  })
}

// -----------------------------------------------------------------------------
// 2. Main Email Function
// -----------------------------------------------------------------------------

/**
 * Sends an email using the configured SMTP provider.
 *
 * @param {object} options - Options for sending email
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {object} options.mailgenContent - Mailgen content object for email body
 *
 * @returns {Promise<ApiResponse>} Success response if email sent
 * @throws {ApiError} If email fails to send
 */
const sendMail = async (options) => {
  // Fix: Strict email validation to prevent header injection
  if (!options.email || !validator.isEmail(options.email)) {
    throw new ApiError(400, "Invalid recipient email address")
  }

  if (!options.subject) {
    throw new ApiError(400, "Email subject is required")
  }

  if (!options.mailgenContent) {
    throw new ApiError(400, "Email content is required")
  }

  // Fix: Sanitize subject line to prevent newline header injection
  const safeSubject = options.subject.replace(/[\r\n]/g, " ")

  // Generate email content
  const emailPlainText = mailGenerator.generatePlaintext(options.mailgenContent)
  const emailHTML = mailGenerator.generate(options.mailgenContent)

  const mailOptions = {
    from: `"TaskFlow" <${process.env.MAIL_FROM || "noreply@taskflow.com"}>`,
    to: options.email,
    subject: safeSubject,
    text: emailPlainText,
    html: emailHTML,
    headers: {
      "X-Mailer": "TaskFlow",
      "X-Priority": "3",
    },
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("✅ Email sent successfully:", {
      messageId: info.messageId,
      to: options.email,
    })
    return new ApiResponse(200, "Email sent successfully")
  } catch (err) {
    // Fix: Log internal error details, but expose a generic message to the client
    console.error("❌ SMTP error detail:", err.message)
    throw new ApiError(500, "Failed to send email. Please try again later.")
  }
}

// -----------------------------------------------------------------------------
// 3. Email Templates
// -----------------------------------------------------------------------------

const emailVerificationMailGenContent = (username, verificationUrl) => ({
  body: {
    action: {
      button: {
        color: "#2563EB",
        link: verificationUrl,
        text: "Verify Email",
      },
      instructions: "Click the button below to verify your email:",
    },
    intro: [
      "Welcome to TaskFlow! We're excited to have you on board.",
      "To get started, please verify your email address by clicking the button below:",
    ],
    name: username,
    outro: [
      "Need help? Just reply to this email - we'd love to help you get started.",
      "If you didn't create this account, you can safely ignore this email.",
    ],
  },
})

const reEmailVerificationMailGenContent = (username, verificationUrl) => ({
  body: {
    action: {
      button: {
        color: "#2563EB",
        link: verificationUrl,
        text: "Verify Email",
      },
      instructions: "Click below to verify your email:",
    },
    intro: "We noticed your email is still unverified. Please verify it to unlock all features:",
    name: username,
    outro: "This verification link will expire in 24 hours.",
  },
})

const forgotPasswordMailgenContent = (username, passwordResetUrl) => ({
  body: {
    action: {
      button: {
        color: "#DC2626",
        link: passwordResetUrl,
        text: "Reset Password",
      },
      instructions: "Click the button below to reset your password:",
    },
    intro: "We received a request to reset your TaskFlow password.",
    name: username,
    outro: [
      "This link will expire in 1 hour for security reasons.",
      "If you didn't request this, you can safely ignore this email - your password will remain unchanged.",
      "For security, never share your password with anyone.",
    ],
  },
})

const taskAssignmentMailgenContent = (username, taskTitle, taskUrl, assignedBy) => ({
  body: {
    action: {
      button: {
        color: "#2563EB",
        link: taskUrl,
        text: "View Task",
      },
      instructions: "Click below to view the task details:",
    },
    intro: `You've been assigned a new task by ${assignedBy}:`,
    name: username,
    outro: "Good luck with the task! Let us know if you need any help.",
    table: {
      columns: { customWidth: { Status: "40%", Task: "60%" } },
      data: [{ Status: "Pending", Task: taskTitle }],
    },
  },
})

const taskDueSoonMailgenContent = (username, taskTitle, dueDate, taskUrl) => ({
  body: {
    action: {
      button: {
        color: "#F59E0B",
        link: taskUrl,
        text: "View Task",
      },
      instructions: "Click below to view and complete the task:",
    },
    intro: "This is a friendly reminder that a task is due soon:",
    name: username,
    outro: "Don't forget to mark the task as complete when you're done!",
    table: {
      data: [{ "Due Date": dueDate, Status: "In Progress", Task: taskTitle }],
    },
  },
})

// New Template: Project Invitation
const projectInvitationMailgenContent = (
  inviteeName,
  inviterName,
  projectName,
  role,
  inviteUrl,
  expiresInHours = 48
) => ({
  body: {
    name: inviteeName,
    intro: `${inviterName} has invited you to collaborate on <strong>${projectName}</strong> on TaskFlow.`,
    table: {
      data: [
        { "": "Project", " ": projectName },
        { "": "Your Role", " ": role },
        { "": "Invited By", " ": inviterName },
      ],
    },
    action: {
      instructions: `Accept your invitation below. This link expires in ${expiresInHours} hours:`,
      button: {
        color: "#2563EB",
        text: "Accept Invitation",
        link: inviteUrl,
      },
    },
    outro: [
      `If you don't have a TaskFlow account yet, you'll be prompted to create one.`,
      "If you weren't expecting this invitation, you can safely ignore this email.",
    ],
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