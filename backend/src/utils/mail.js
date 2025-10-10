import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import ApiError from "./api-error.js";
import { ApiResponse } from "./api-response.js";

/**
 * Sends an email using nodemailer.
 *
 * @param {object} options - Options to be passed to nodemailer's sendMail method.
 * @param {string} options.email - The email address of the recipient.
 * @param {string} options.subject - The subject line of the email.
 * @param {object} options.mailgenContent - The Mailgen content to be rendered as the email body.
 *
 * @throws {ApiError} If the email could not be sent.
 *
 * @returns {Promise<ApiResponse>} A Promise that resolves with an ApiResponse containing the status code and message of the response.
 */
const sendMail = async (options) => {
	// console.log(options);
	const mailGenerator = new Mailgen({
		product: {
			copyright: `Copyright © ${new Date().getFullYear()} Mailgen. All rights reserved.`,
			link: "https://mailgen.js",
			name: "Task Manager",
		},
		theme: "default",
	});
	const emailPlainText = mailGenerator.generatePlaintext(
		options.mailgenContent,
	);
	const emailHTML = mailGenerator.generate(options.mailgenContent);
	const transporter = nodemailer.createTransport({
		auth: {
			pass: process.env.MAILTRAP_PASSWORD,
			user: process.env.MAILTRAP_USERNAME,
		},
		host: process.env.MAILTRAP_HOST,
		port: process.env.MAILTRAP_PORT,
		secure: false, // true for port 465, false for other ports
	});
	const mailOptions = {
		from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>',
		html: emailHTML,
		subject: options.subject,
		text: emailPlainText,
		to: options.email,
	};
	try {
		await transporter.sendMail(mailOptions);
		throw new ApiResponse(200, "Email sent successfully");
	} catch (err) {
		throw new ApiError(400, "Email not sent");
	} finally {
		return;
	}
};

/**
 * Generates email content for email verification using Mailgen.
 *
 * @param {string} username - The name of the user to be included in the email.
 * @param {string} verificationUrl - The URL link for the user to verify their email.
 * @returns {Object} - The email content object with body, name, and action/button details.
 */

const emailVerificationMailGenContent = (username, verificationUrl) => ({
	body: {
		action: {
			button: {
				color: "#22BC66",
				link: verificationUrl,
				text: "Verify your email",
			},
			instructions: "To get started with Task Manager, please click here:",
			outro:
				"Need help, or have questions? Just reply to this email, we'd love to help.",
		},
		name: username,
	},
});

const reEmailVerificationMailGenContent = (username, verificationUrl) => ({
	body: {
		action: {
			button: {
				color: "#22BC66",
				link: verificationUrl,
				text: "Verify your email",
			},
			instructions: "To get started with Task Manager, please click here:",
			outro:
				"Need help, or have questions? Just reply to this email, we'd love to help.",
		},
		name: username,
	},
});

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
	return {
		body: {
			action: {
				button: {
					color: "#22BC66", // Optional action button color
					link: passwordResetUrl,
					text: "Reset password",
				},
				instructions:
					"To reset your password click on the following button or link:",
			},
			intro: "We got a request to reset the password of your account",
			name: username,
			outro:
				"Need help, or have questions? Just reply to this email, we'd love to help.",
		},
	};
};

export {
	sendMail,
	emailVerificationMailGenContent,
	forgotPasswordMailgenContent,
	reEmailVerificationMailGenContent,
};
