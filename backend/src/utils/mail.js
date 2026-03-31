import Mailgen from "mailgen"
import ApiError from "./api-error.js"
import { ApiResponse } from "./api-response.js"

/**
 * Sends an email using Brevo (Sendinblue) SMTP.
 * Works with any SMTP provider (Brevo, Resend, SendGrid, AWS SES, etc.)
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
	// Validate email first
	if (!options.email || !options.email.includes("@")) {
		throw new ApiError(400, "Invalid recipient email address")
	}

	// Validate required fields
	if (!options.subject) {
		throw new ApiError(400, "Email subject is required")
	}

	if (!options.mailgenContent) {
		throw new ApiError(400, "Email content is required")
	}

	// Initialize Mailgen with TaskFlow branding
	const mailGenerator = new Mailgen({
		product: {
			copyright: `Copyright © ${new Date().getFullYear()} TaskFlow. All rights reserved.`,
			link: process.env.BASE_URL || "https://taskflow.com",
			logo: process.env.EMAIL_LOGO_URL || "https://placehold.co/200x50/2563EB/FFFFFF?text=TaskFlow",
			name: "TaskFlow",
		},
		theme: "cerberus", // Professional email theme
	})

	// Generate email content (HTML + plain text)
	const emailPlainText = mailGenerator.generatePlaintext(options.mailgenContent)
	const emailHTML = mailGenerator.generate(options.mailgenContent)

	// Create SMTP transporter
	const transporter = await import("nodemailer").then((m) =>
		m.default.createTransport({
			auth: {
				pass: process.env.MAIL_PASSWORD,
				user: process.env.MAIL_USERNAME,
			},
			host: process.env.MAIL_HOST,
			port: parseInt(process.env.MAIL_PORT) || 587,
			secure: process.env.MAIL_PORT === "465", // true for 465, false for other ports
			tls: {
				rejectUnauthorized: process.env.NODE_ENV === "production", // Allow self-signed in dev
			},
		}),
	)

	const mailOptions = {
		from: `"TaskFlow 👻" <${process.env.EMAIL_FROM || "noreply@taskflow.com"}>`,
		// Add headers for better deliverability
		headers: {
			"X-Mailer": "TaskFlow",
			"X-Priority": "3",
		},
		html: emailHTML,
		subject: options.subject,
		text: emailPlainText,
		to: options.email,
	}

	try {
		const info = await transporter.sendMail(mailOptions)
		console.log("✅ Email sent successfully:", {
			messageId: info.messageId,
			subject: options.subject,
			to: options.email,
		})
		return new ApiResponse(200, "Email sent successfully")
	} catch (err) {
		console.error("❌ Email sending failed:", {
			error: err.message,
			subject: options.subject,
			to: options.email,
		})
		throw new ApiError(500, `Failed to send email: ${err.message}`)
	}
}

/**
 * Generates email content for email verification using Mailgen.
 *
 * @param {string} username - User's name to include in email
 * @param {string} verificationUrl - URL for email verification
 * @returns {Object} Mailgen content object
 */
const emailVerificationMailGenContent = (username, verificationUrl) => ({
	body: {
		action: {
			button: {
				color: "#2563EB", // TaskFlow blue
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

/**
 * Generates email content for resending verification email.
 *
 * @param {string} username - User's name
 * @param {string} verificationUrl - Verification URL
 * @returns {Object} Mailgen content object
 */
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

/**
 * Generates email content for password reset.
 *
 * @param {string} username - User's name
 * @param {string} passwordResetUrl - Password reset URL
 * @returns {Object} Mailgen content object
 */
const forgotPasswordMailgenContent = (username, passwordResetUrl) => ({
	body: {
		action: {
			button: {
				color: "#DC2626", // Red for important action
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

/**
 * Generates email content for task assignment notification.
 *
 * @param {string} username - User's name
 * @param {string} taskTitle - Title of assigned task
 * @param {string} taskUrl - URL to view the task
 * @param {string} assignedBy - Name of person who assigned the task
 * @returns {Object} Mailgen content object
 */
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
			columns: {
				customWidth: {
					Status: "40%",
					Task: "60%",
				},
			},
			data: [
				{
					Status: "Pending",
					Task: taskTitle,
				},
			],
		},
	},
})

/**
 * Generates email content for task due soon reminder.
 *
 * @param {string} username - User's name
 * @param {string} taskTitle - Task title
 * @param {string} dueDate - Due date string
 * @param {string} taskUrl - Task URL
 * @returns {Object} Mailgen content object
 */
const taskDueSoonMailgenContent = (username, taskTitle, dueDate, taskUrl) => ({
	body: {
		action: {
			button: {
				color: "#F59E0B", // Amber for urgency
				link: taskUrl,
				text: "View Task",
			},
			instructions: "Click below to view and complete the task:",
		},
		intro: "This is a friendly reminder that a task is due soon:",
		name: username,
		outro: "Don't forget to mark the task as complete when you're done!",
		table: {
			data: [
				{
					"Due Date": dueDate,
					Status: "In Progress",
					Task: taskTitle,
				},
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
}
