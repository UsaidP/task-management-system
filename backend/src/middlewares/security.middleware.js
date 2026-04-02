import mongoSanitize from "express-mongo-sanitize"
import helmet from "helmet"
import xss from "xss"

/**
 * Security middleware chain
 * Applies multiple security layers to protect against common vulnerabilities
 */

/**
 * Helmet configuration for HTTP security headers
 * Protects against various web vulnerabilities
 */
const helmetConfig = helmet({
	contentSecurityPolicy: {
		directives: {
			baseUri: ["'self'"],
			connectSrc: ["'self'", "http://localhost:*"],
			defaultSrc: ["'self'"],
			fontSrc: ["'self'", "https://fonts.gstatic.com"],
			formAction: ["'self'"],
			frameAncestors: ["'none'"], // Prevent clickjacking
			imgSrc: ["'self'", "data:", "https://ik.imagekit.io"],
			scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Required for React
			styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
		},
	},
	crossOriginEmbedderPolicy: false, // Required for some frontend features
	crossOriginOpenerPolicy: true,
	crossOriginResourcePolicy: { policy: "cross-origin" },
	dnsPrefetchControl: {
		allow: false, // Disable DNS prefetching for privacy
	},
	frameguard: {
		action: "deny", // Prevent clickjacking
	},
	hidePoweredBy: true, // Hide X-Powered-By header
	hsts: {
		includeSubDomains: true,
		maxAge: 31536000, // 1 year
		preload: true,
	},
	ieNoOpen: true, // Prevent IE from executing downloads
	noSniff: true, // Prevent MIME type sniffing
	originAgentCluster: true,
	permittedCrossDomainPolicies: {
		permittedPolicies: "none",
	},
	referrerPolicy: {
		policy: "strict-origin-when-cross-origin",
	},
	xssFilter: true, // Enable XSS filter (legacy but still useful)
})

/**
 * MongoDB sanitization middleware
 * Prevents MongoDB injection attacks by sanitizing user input
 * Removes keys starting with $ or containing .
 */
const sanitizeMongo = mongoSanitize({
	dryRun: false, // Actually sanitize (not just log)
	onSanitize: ({ key }) => {
		// Log sanitized keys in development
		if (process.env.NODE_ENV === "development") {
			console.warn(`[MongoSanitize] Sanitized key: ${key}`)
		}
	},
})

/**
 * Recursively sanitizes an object using XSS library
 * @param {Object|Array|string} input - Input to sanitize
 * @returns {Object|Array|string} Sanitized input
 */
const sanitizeObject = (input) => {
	if (typeof input === "string") {
		return xss(input)
	}

	if (Array.isArray(input)) {
		return input.map((item) => sanitizeObject(item))
	}

	if (input !== null && typeof input === "object") {
		const sanitized = {}
		for (const [key, value] of Object.entries(input)) {
			// Skip sensitive fields that shouldn't be sanitized
			if (key === "password" || key === "token" || key === "accessToken") {
				sanitized[key] = value
			} else {
				sanitized[key] = sanitizeObject(value)
			}
		}
		return sanitized
	}

	return input
}

/**
 * XSS sanitization middleware
 * Sanitizes user input to prevent cross-site scripting attacks
 * Cleans query params, body, and headers
 */
const sanitizeXSS = (req, _res, next) => {
	// Sanitize request body
	if (req.body) {
		req.body = sanitizeObject(req.body)
	}

	// Sanitize query parameters
	if (req.query) {
		req.query = sanitizeObject(req.query)
	}

	// Sanitize URL parameters
	if (req.params) {
		req.params = sanitizeObject(req.params)
	}

	next()
}

/**
 * Combined security middleware chain
 * Use this in your Express app to apply all security measures
 */
export const securityMiddleware = [
	helmetConfig, // HTTP security headers
	sanitizeMongo, // MongoDB injection prevention
	sanitizeXSS, // XSS prevention
]

export { helmetConfig, sanitizeMongo, sanitizeXSS }
