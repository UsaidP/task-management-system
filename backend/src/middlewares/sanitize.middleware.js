/**
 * Input Sanitization Middleware
 * Cleans and validates user input to prevent injection attacks
 */

/**
 * Sanitizes string input by removing potentially dangerous characters
 * @param {string} str - Input string to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
	if (typeof str !== "string") return str

	return str
		.replace(/[<>]/g, "") // Remove < and >
		.replace(/javascript:/gi, "") // Remove javascript: protocol
		.replace(/on\w+=/gi, "") // Remove event handlers (onclick=, onerror=, etc.)
		.replace(/script:/gi, "") // Remove script: protocol
		.trim()
}

/**
 * Recursively sanitizes an object's string properties
 * @param {Object|Array|string} input - Input to sanitize
 * @returns {Object|Array|string} Sanitized input
 */
const sanitizeObject = (input) => {
	if (typeof input === "string") {
		return sanitizeString(input)
	}

	if (Array.isArray(input)) {
		return input.map((item) => sanitizeObject(item))
	}

	if (input !== null && typeof input === "object") {
		const sanitized = {}
		for (const key of Object.keys(input)) {
			// Skip sensitive fields that shouldn't be sanitized
			if (key === "password" || key === "token" || key === "accessToken") {
				sanitized[key] = input[key]
			} else {
				sanitized[key] = sanitizeObject(input[key])
			}
		}
		return sanitized
	}

	return input
}

/**
 * Middleware to sanitize all request input
 * Cleans query parameters, body, and params
 */
const sanitizeInput = (req, res, next) => {
	// Sanitize query parameters
	if (req.query) {
		req.query = sanitizeObject(req.query)
	}

	// Sanitize URL parameters
	if (req.params) {
		req.params = sanitizeObject(req.params)
	}

	// Sanitize request body (if it exists)
	if (req.body && typeof req.body === "object") {
		req.body = sanitizeObject(req.body)
	}

	next()
}

/**
 * Validates that required fields exist in an object
 * @param {string[]} fields - Array of required field names
 * @returns {Function} Middleware function
 *
 * @example
 * router.post('/users', validateRequiredFields('email', 'password'), createUser)
 */
const validateRequiredFields = (...fields) => {
	return (req, res, next) => {
		const missingFields = fields.filter((field) => {
			const value = req.body?.[field]
			return value === undefined || value === null || value === ""
		})

		if (missingFields.length > 0) {
			return res.status(400).json({
				errors: missingFields.map((field) => ({ [field]: `${field} is required` })),
				message: `Missing required fields: ${missingFields.join(", ")}`,
				success: false,
			})
		}

		next()
	}
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

/**
 * Middleware to validate email format
 */
const validateEmail = (req, res, next) => {
	const { email } = req.body

	if (email && !isValidEmail(email)) {
		return res.status(400).json({
			errors: [{ email: "Please provide a valid email address" }],
			message: "Invalid email format",
			success: false,
		})
	}

	next()
}

/**
 * Validates password strength
 * Requirements: 8+ chars, 1 uppercase, 1 lowercase, 1 number
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors
 */
const validatePasswordStrength = (password) => {
	const errors = []

	if (!password || password.length < 8) {
		errors.push("Password must be at least 8 characters long")
	}

	if (password && !/[A-Z]/.test(password)) {
		errors.push("Password must contain at least one uppercase letter")
	}

	if (password && !/[a-z]/.test(password)) {
		errors.push("Password must contain at least one lowercase letter")
	}

	if (password && !/[0-9]/.test(password)) {
		errors.push("Password must contain at least one number")
	}

	return {
		errors,
		isValid: errors.length === 0,
	}
}

/**
 * Middleware to validate password strength
 */
const validatePassword = (req, res, next) => {
	const { password } = req.body

	if (password) {
		const validation = validatePasswordStrength(password)
		if (!validation.isValid) {
			return res.status(400).json({
				errors: validation.errors.map((err) => ({ password: err })),
				message: "Password does not meet requirements",
				success: false,
			})
		}
	}

	next()
}

/**
 * Limits the size of request body to prevent DoS
 * @param {number} maxSize - Maximum size in bytes (default: 10kb)
 */
const limitRequestBodySize = (maxSize = 10 * 1024) => {
	return (req, res, next) => {
		const contentLength = parseInt(req.headers["content-length"], 10)

		if (contentLength && contentLength > maxSize) {
			return res.status(413).json({
				message: `Request body too large. Maximum size is ${maxSize / 1024}KB`,
				success: false,
			})
		}

		next()
	}
}

export {
	sanitizeInput,
	sanitizeObject,
	sanitizeString,
	validateRequiredFields,
	validateEmail,
	validatePassword,
	validatePasswordStrength,
	limitRequestBodySize,
}
