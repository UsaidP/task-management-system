import Mailgen from "mailgen"
import nodemailer from "nodemailer"
import { Resend } from "resend"
import validator from "validator"
import ApiError from "./api-error.js"
import { ApiResponse } from "./api-response.js"

// -----------------------------------------------------------------------------
// 1. Initialize Mailgen once
// -----------------------------------------------------------------------------

// Initialize Mailgen once with TaskFlow branding
const mailGenerator = new Mailgen({
	product: {
		copyright: `Copyright © ${new Date().getFullYear()} TaskFlow. All rights reserved.`,
		link: process.env.BASE_URL || "https://taskflow.com",
		logo: process.env.EMAIL_LOGO_URL || "https://placehold.co/200x50/C4654A/FAF6F1?text=TaskFlow",
		name: "TaskFlow",
	},
	theme: "cerberus",
	// Custom theme colors matching TaskFlow palette
	themeConfig: {
		backgroundColor: "#FAF6F1", // Linen
		bodyCell: {
			backgroundColor: "#FAF6F1",
			contentColor: "#2C2420",
		},
		contentCell: {
			backgroundColor: "#FAF6F1",
			contentColor: "#2C2420", // Espresso
		},
		contentFont: "DM Sans, system-ui, -apple-system, sans-serif",
		primaryColor: "#C4654A", // Terracotta
		secondaryColor: "#5C4B3A", // Earth brown
		titleFont: "Lora, Georgia, serif",
	},
})

// -----------------------------------------------------------------------------
// 2. Email Provider Setup (Resend for production, SMTP for local dev)
// -----------------------------------------------------------------------------

let transporter = null
let resendClient = null
let emailProvider = null // "resend" or "smtp"
let providerInitialized = false

function initEmailProvider() {
	if (providerInitialized) return emailProvider

	// Prefer Resend if API key is available (works on Railway)
	if (process.env.RESEND_API_KEY) {
		resendClient = new Resend(process.env.RESEND_API_KEY)
		emailProvider = "resend"
		console.log("📧 Email provider: Resend API")
	} else {
		// Fall back to SMTP for local development
		const mailPort = parseInt(process.env.MAIL_PORT, 10) || 587

		transporter = nodemailer.createTransport({
			auth: {
				pass: process.env.MAIL_PASS,
				user: process.env.MAIL_USER,
			},
			host: process.env.MAIL_HOST,
			maxConnections: 5,
			maxMessages: 100,
			pool: true,
			port: mailPort,
			secure: mailPort === 465,
			tls: {
				rejectUnauthorized: process.env.NODE_ENV === "production",
			},
		})
		emailProvider = "smtp"
		console.log("📧 Email provider: SMTP")
	}

	// Verify connection on first init
	if (process.env.NODE_ENV !== "test" && !providerInitialized) {
		providerInitialized = true
		if (emailProvider === "smtp") {
			console.log("🔌 Verifying SMTP connection...")
			transporter.verify((error) => {
				if (error) {
					console.error("❌ SMTP Connection Failed (Emails will not send):", error.message)
				} else {
					console.log("✅ SMTP Connected — Emails are ready to send")
				}
			})
		} else {
			console.log("✅ Resend API initialized — Emails are ready to send")
		}
	}

	return emailProvider
}

function getTransporter() {
	initEmailProvider()
	if (!transporter) {
		throw new Error("SMTP transporter not initialized. Check MAIL_HOST and MAIL_PORT env vars.")
	}
	return transporter
}

function getResendClient() {
	initEmailProvider()
	if (!resendClient) {
		throw new Error("Resend client not initialized. Check RESEND_API_KEY env var.")
	}
	return resendClient
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

	const _mailOptions = {
		from: `"TaskFlow" <${process.env.EMAIL_FROM || process.env.MAIL_FROM || "noreply@taskflow.com"}>`,
		headers: {
			"X-Mailer": "TaskFlow",
			"X-Priority": "3",
		},
		html: emailHTML,
		subject: safeSubject,
		text: emailPlainText,
		to: options.email,
	}

	try {
		initEmailProvider()

		if (emailProvider === "resend") {
			// Send via Resend API
			const fromAddress =
				process.env.RESEND_FROM ||
				process.env.EMAIL_FROM ||
				process.env.MAIL_FROM ||
				"onboarding@resend.dev"
			const { data, error } = await getResendClient().emails.send({
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

			console.log("✅ Email sent via Resend:", {
				emailId: data?.id,
				to: options.email,
			})
		} else {
			// Send via SMTP
			const mailOptions = {
				from: `"TaskFlow" <${process.env.EMAIL_FROM || process.env.MAIL_FROM || "noreply@taskflow.com"}>`,
				headers: {
					"X-Mailer": "TaskFlow",
					"X-Priority": "3",
				},
				html: emailHTML,
				subject: safeSubject,
				text: emailPlainText,
				to: options.email,
			}

			const info = await getTransporter().sendMail(mailOptions)
			console.log("✅ Email sent via SMTP:", {
				messageId: info.messageId,
				to: options.email,
			})
		}

		return new ApiResponse(200, "Email sent successfully")
	} catch (err) {
		if (err instanceof ApiError) throw err
		console.error("❌ Email send error:", err.message)
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
				color: "#C4654A", // Terracotta — TaskFlow primary accent
				link: verificationUrl,
				text: "Verify Your Email",
			},
			instructions: "Click the button below to verify your email and get started:",
		},
		greeting: `Welcome to TaskFlow, ${username}!`,
		intro: [
			"We're excited to have you on board. To unlock all features and get started, please verify your email address:",
		],
		outro: [
			"Need help? Just reply to this email — we'd love to help you get started.",
			"If you didn't create this account, you can safely ignore this email.",
		],
		signature: false,
	},
})

const reEmailVerificationMailGenContent = (username, verificationUrl) => ({
	body: {
		action: {
			button: {
				color: "#C4654A", // Terracotta
				link: verificationUrl,
				text: "Verify Your Email",
			},
			instructions: "Click below to verify your email and unlock all features:",
		},
		greeting: `Hey ${username},`,
		intro: [
			"We noticed your email is still unverified. Verify it to access all TaskFlow features:",
		],
		outro: ["This verification link will expire in 24 hours."],
		signature: false,
	},
})

const forgotPasswordMailgenContent = (username, passwordResetUrl) => ({
	body: {
		action: {
			button: {
				color: "#C44A4A", // Warm red — urgent action
				link: passwordResetUrl,
				text: "Reset Your Password",
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
			button: {
				color: "#C4654A", // Terracotta
				link: taskUrl,
				text: "View Task",
			},
			instructions: "Click below to view the task details:",
		},
		greeting: `Hey ${username},`,
		intro: [`You've been assigned a new task by ${assignedBy}:`],
		outro: ["Good luck with the task! Let us know if you need any help."],
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
			button: {
				color: "#D4A548", // Ochre — warning/attention
				link: taskUrl,
				text: "View Task",
			},
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

// New Template: Project Invitation
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
			button: {
				color: "#C4654A", // Terracotta
				link: inviteUrl,
				text: "Accept Invitation",
			},
			instructions: `Accept your invitation below. This link expires in ${expiresInHours} hours:`,
		},
		greeting: `Hey ${inviteeName},`,
		intro: [`${inviterName} has invited you to collaborate on **${projectName}** on TaskFlow.`],
		outro: [
			`If you don't have a TaskFlow account yet, you'll be prompted to create one.`,
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
