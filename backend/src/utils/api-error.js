/**
 * @fileoverview Enterprise-grade API Error class for standardized error handling
 *
 * This implementation follows industry best practices for error handling in large-scale
 * Node.js applications with features like:
 * - Error categorization (operational vs. programming)
 * - Standardized error codes aligned with HTTP status codes
 * - Full serialization support for consistent API responses
 * - Integration points with monitoring systems
 * - Proper inheritance from native Error
 * - Support for error hierarchies
 */

/**
 * Standard HTTP status codes mapped to readable names
 * Used for generating consistent error codes across the application
 */
export const HTTP_STATUS = {
	ACCEPTED: 202,
	BAD_GATEWAY: 502,
	BAD_REQUEST: 400,
	CONFLICT: 409,
	CREATED: 201,
	FORBIDDEN: 403,
	GATEWAY_TIMEOUT: 504,
	INTERNAL_SERVER_ERROR: 500,
	METHOD_NOT_ALLOWED: 405,
	NO_CONTENT: 204,
	NOT_FOUND: 404,
	NOT_IMPLEMENTED: 501,
	OK: 200,
	PAYMENT_REQUIRED: 402,
	SERVICE_UNAVAILABLE: 503,
	TOO_MANY_REQUESTS: 429,
	UNAUTHORIZED: 401,
	UNPROCESSABLE_ENTITY: 422,
}

/**
 * Error categories for better classification and handling
 */
export const ERROR_CATEGORIES = {
	/**
	 * External errors represent failures in external services/dependencies
	 * Examples: database connection failures, third-party API failures
	 * These may require failover mechanisms or retries
	 */
	EXTERNAL: "external",
	/**
	 * Operational errors represent runtime problems with known/expected causes
	 * Examples: validation errors, resource not found, bad user input
	 * These can be handled gracefully and don't necessarily need alerts
	 */
	OPERATIONAL: "operational",

	/**
	 * Programming errors represent unexpected bugs/defects in the code
	 * Examples: trying to read property of undefined, null reference errors
	 * These indicate bugs that need to be fixed and should trigger alerts
	 */
	PROGRAMMING: "programming",

	/**
	 * System errors represent issues with the system environment
	 * Examples: out of memory, file system errors, network failures
	 * These may require system-level intervention
	 */
	SYSTEM: "system",
}

/**
 * Standardized error codes mapped to HTTP status codes and error types
 * Allows for consistent error identification across the application
 */
export const ERROR_CODES = {
	// Authentication errors (401)
	AUTHENTICATION_REQUIRED: {
		code: "AUTH_001",
		message: "Authentication required",
		status: HTTP_STATUS.UNAUTHORIZED,
	},
	DATABASE_ERROR: {
		code: "SRV_002",
		message: "Database error",
		status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
	},

	// Conflict errors (409)
	DUPLICATE_ENTRY: {
		code: "CONF_001",
		message: "Duplicate entry",
		status: HTTP_STATUS.CONFLICT,
	},
	EXPIRED_TOKEN: {
		code: "AUTH_003",
		message: "Expired token",
		status: HTTP_STATUS.UNAUTHORIZED,
	},
	EXTERNAL_SERVICE_ERROR: {
		code: "SRV_003",
		message: "External service error",
		status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
	},
	INSUFFICIENT_PRIVILEGES: {
		code: "PERM_002",
		message: "Insufficient privileges",
		status: HTTP_STATUS.FORBIDDEN,
	},

	// Server errors (500)
	INTERNAL_ERROR: {
		code: "SRV_001",
		message: "Internal server error",
		status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
	},
	INVALID_CREDENTIALS: {
		code: "AUTH_002",
		message: "Invalid credentials",
		status: HTTP_STATUS.UNAUTHORIZED,
	},
	INVALID_INPUT: {
		code: "VAL_002",
		message: "Invalid input",
		status: HTTP_STATUS.BAD_REQUEST,
	},
	INVALID_TOKEN: {
		code: "AUTH_004",
		message: "Invalid token",
		status: HTTP_STATUS.UNAUTHORIZED,
	},
	MISSING_REQUIRED_FIELD: {
		code: "VAL_003",
		message: "Missing required field",
		status: HTTP_STATUS.BAD_REQUEST,
	},

	// Authorization errors (403)
	PERMISSION_DENIED: {
		code: "PERM_001",
		message: "Permission denied",
		status: HTTP_STATUS.FORBIDDEN,
	},

	// Rate limiting (429)
	RATE_LIMIT_EXCEEDED: {
		code: "RATE_001",
		message: "Rate limit exceeded",
		status: HTTP_STATUS.TOO_MANY_REQUESTS,
	},
	RESOURCE_CONFLICT: {
		code: "CONF_002",
		message: "Resource conflict",
		status: HTTP_STATUS.CONFLICT,
	},

	// Resource errors (404)
	RESOURCE_NOT_FOUND: {
		code: "RES_001",
		message: "Resource not found",
		status: HTTP_STATUS.NOT_FOUND,
	},

	// Custom error code for fallback
	UNKNOWN_ERROR: {
		code: "UNK_001",
		message: "Unknown error",
		status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
	},
	USER_NOT_FOUND: {
		code: "RES_002",
		message: "User not found",
		status: HTTP_STATUS.NOT_FOUND,
	},

	// Validation errors (400)
	VALIDATION_ERROR: {
		code: "VAL_001",
		message: "Validation error",
		status: HTTP_STATUS.BAD_REQUEST,
	},
}

/**
 * Enterprise-grade ApiError class for standardized error handling
 *
 * @class ApiError
 * @extends Error
 */
class ApiError extends Error {
	/**
	 * Creates a new API Error instance with standardized properties
	 *
	 * @param {number} statusCode - HTTP status code (defaults to 500)
	 * @param {string} message - Human-readable error message
	 * @param {Array|Object} [errors=[]] - Validation errors or additional error details
	 * @param {string} [stack=null] - Stack trace (will be captured automatically if null)
	 * @param {boolean} [success=false] - Whether the operation was successful (typically false for errors)
	 * @param {string} [errorCode=null] - Custom error code for more specific error identification
	 * @param {string} [category=ERROR_CATEGORIES.OPERATIONAL] - Error category for classification
	 * @param {Object} [metadata={}] - Additional metadata about the error context
	 */
	constructor(
		statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
		message,
		errors = [],
		stack = null,
		success = false,
		errorCode = null,
		category = ERROR_CATEGORIES.OPERATIONAL,
		metadata = {},
	) {
		// Call parent Error constructor with message
		super(message)

		/**
		 * HTTP status code for the error response
		 * @type {number}
		 */
		this.statusCode = statusCode

		/**
		 * Unique error code for specific error identification
		 * If not provided, mapped from status code or defaults to UNKNOWN_ERROR
		 * @type {string}
		 */
		this.errorCode = errorCode || this._mapStatusCodeToErrorCode(statusCode)

		/**
		 * Flag indicating whether the operation was successful
		 * Typically false for errors, but kept for compatibility
		 * @type {boolean}
		 */
		this.success = success

		/**
		 * Detailed error information
		 * - For validation errors: array of field-specific errors
		 * - For other errors: any structured error data
		 * @type {Array|Object}
		 */
		this.errors = Array.isArray(errors) ? errors : [errors]

		/**
		 * Error category for classification and handling strategies
		 * @type {string}
		 */
		this.category = category

		/**
		 * Additional contextual information about the error
		 * Useful for debugging and error tracking
		 * @type {Object}
		 */
		this.metadata = metadata

		/**
		 * ISO timestamp when the error occurred
		 * @type {string}
		 */
		this.timestamp = new Date().toISOString()

		/**
		 * Error stack trace
		 * If not provided, captured automatically
		 * @type {string}
		 */
		if (stack) {
			this.stack = stack
		} else {
			Error.captureStackTrace(this, this.constructor)
		}

		/**
		 * Used for error monitoring integration in asyncHandler
		 * @type {boolean}
		 */
		this.isOperational = category === ERROR_CATEGORIES.OPERATIONAL
	}

	/**
	 * Maps HTTP status code to a standard error code
	 * @private
	 * @param {number} statusCode - HTTP status code to map
	 * @returns {string} Mapped error code
	 */
	_mapStatusCodeToErrorCode(statusCode) {
		// Find matching error code from our defined ERROR_CODES
		const matchingErrorCode = Object.values(ERROR_CODES).find(
			(err) => err.status === statusCode,
		)

		// If found, return the code, otherwise use UNKNOWN_ERROR
		return matchingErrorCode
			? matchingErrorCode.code
			: ERROR_CODES.UNKNOWN_ERROR.code
	}

	/**
	 * Serializes the error to a plain object for API responses
	 * Adapts based on environment (development vs. production)
	 *
	 * @param {boolean} [includeStack=false] - Whether to include stack trace
	 * @returns {Object} Serialized error object
	 */
	toJSON(includeStack = process.env.NODE_ENV === "development") {
		const serialized = {
			errorCode: this.errorCode,
			errors: this.errors,
			message: this.message,
			statusCode: this.statusCode,
			success: this.success,
			timestamp: this.timestamp,
		}

		// Only include stack in development or if explicitly requested
		if (includeStack) {
			serialized.stack = this.stack
		}

		// Include metadata in development or if it has content
		if (
			process.env.NODE_ENV === "development" ||
			Object.keys(this.metadata).length > 0
		) {
			serialized.metadata = this.metadata
		}

		return serialized
	}

	/**
	 * Creates an ApiError instance from an error code defined in ERROR_CODES
	 *
	 * @static
	 * @param {string} errorCodeKey - Key from ERROR_CODES (e.g., 'RESOURCE_NOT_FOUND')
	 * @param {string} [customMessage=null] - Optional custom message to override default
	 * @param {Array|Object} [errors=[]] - Additional error details
	 * @param {Object} [metadata={}] - Additional error metadata
	 * @returns {ApiError} New ApiError instance
	 *
	 * @example
	 * Create a not found error
	 * throw ApiError.fromCode('RESOURCE_NOT_FOUND', 'User with id 123 not found');
	 */
	static fromCode(
		errorCodeKey,
		customMessage = null,
		errors = [],
		metadata = {},
	) {
		const errorDef = ERROR_CODES[errorCodeKey] || ERROR_CODES.UNKNOWN_ERROR
		return new ApiError(
			errorDef.status,
			customMessage || errorDef.message,
			errors,
			null, // Stack will be captured automatically
			false,
			errorDef.code,
			ERROR_CATEGORIES.OPERATIONAL,
			metadata,
		)
	}

	/**
	 * Creates a BAD_REQUEST (400) error
	 * @static
	 * @param {string} message - Error message
	 * @param {Array|Object} [errors=[]] - Validation errors
	 * @param {Object} [metadata={}] - Additional context
	 * @returns {ApiError} New ApiError instance
	 */
	static badRequest(message, errors = [], metadata = {}) {
		return new ApiError(
			HTTP_STATUS.BAD_REQUEST,
			message,
			errors,
			null,
			false,
			ERROR_CODES.VALIDATION_ERROR.code,
			ERROR_CATEGORIES.OPERATIONAL,
			metadata,
		)
	}

	/**
	 * Creates an UNAUTHORIZED (401) error
	 * @static
	 * @param {string} message - Error message
	 * @param {Array|Object} [errors=[]] - Error details
	 * @param {Object} [metadata={}] - Additional context
	 * @returns {ApiError} New ApiError instance
	 */
	static unauthorized(message, errors = [], metadata = {}) {
		return new ApiError(
			HTTP_STATUS.UNAUTHORIZED,
			message,
			errors,
			null,
			false,
			ERROR_CODES.AUTHENTICATION_REQUIRED.code,
			ERROR_CATEGORIES.OPERATIONAL,
			metadata,
		)
	}

	/**
	 * Creates a FORBIDDEN (403) error
	 * @static
	 * @param {string} message - Error message
	 * @param {Array|Object} [errors=[]] - Error details
	 * @param {Object} [metadata={}] - Additional context
	 * @returns {ApiError} New ApiError instance
	 */
	static forbidden(message, errors = [], metadata = {}) {
		return new ApiError(
			HTTP_STATUS.FORBIDDEN,
			message,
			errors,
			null,
			false,
			ERROR_CODES.PERMISSION_DENIED.code,
			ERROR_CATEGORIES.OPERATIONAL,
			metadata,
		)
	}

	/**
	 * Creates a NOT_FOUND (404) error
	 * @static
	 * @param {string} message - Error message
	 * @param {Array|Object} [errors=[]] - Error details
	 * @param {Object} [metadata={}] - Additional context
	 * @returns {ApiError} New ApiError instance
	 */
	static notFound(message, errors = [], metadata = {}) {
		return new ApiError(
			HTTP_STATUS.NOT_FOUND,
			message,
			errors,
			null,
			false,
			ERROR_CODES.RESOURCE_NOT_FOUND.code,
			ERROR_CATEGORIES.OPERATIONAL,
			metadata,
		)
	}

	/**
	 * Creates a CONFLICT (409) error
	 * @static
	 * @param {string} message - Error message
	 * @param {Array|Object} [errors=[]] - Error details
	 * @param {Object} [metadata={}] - Additional context
	 * @returns {ApiError} New ApiError instance
	 */
	static conflict(message, errors = [], metadata = {}) {
		return new ApiError(
			HTTP_STATUS.CONFLICT,
			message,
			errors,
			null,
			false,
			ERROR_CODES.DUPLICATE_ENTRY.code,
			ERROR_CATEGORIES.OPERATIONAL,
			metadata,
		)
	}

	/**
	 * Creates an INTERNAL_SERVER_ERROR (500) error
	 * @static
	 * @param {string} message - Error message
	 * @param {Array|Object} [errors=[]] - Error details
	 * @param {Object} [metadata={}] - Additional context
	 * @returns {ApiError} New ApiError instance
	 */
	static internal(
		message = "Internal server error",
		errors = [],
		metadata = {},
	) {
		return new ApiError(
			HTTP_STATUS.INTERNAL_SERVER_ERROR,
			message,
			errors,
			null,
			false,
			ERROR_CODES.INTERNAL_ERROR.code,
			ERROR_CATEGORIES.PROGRAMMING, // Internal errors are typically programming errors
			metadata,
		)
	}

	/**
	 * Creates a custom error with provided details
	 * @static
	 * @param {number} statusCode - HTTP status code
	 * @param {string} message - Error message
	 * @param {Array|Object} [errors=[]] - Error details
	 * @param {string} [errorCode=null] - Custom error code
	 * @param {string} [category=ERROR_CATEGORIES.OPERATIONAL] - Error category
	 * @param {Object} [metadata={}] - Additional context
	 * @returns {ApiError} New ApiError instance
	 */
	static custom(
		statusCode,
		message,
		errors = [],
		errorCode = null,
		category = ERROR_CATEGORIES.OPERATIONAL,
		metadata = {},
	) {
		return new ApiError(
			statusCode,
			message,
			errors,
			null,
			false,
			errorCode,
			category,
			metadata,
		)
	}

	/**
	 * Converts any error to an ApiError
	 * @static
	 * @param {Error} error - Error to convert
	 * @param {number} [defaultStatusCode=500] - Default status code if not an ApiError
	 * @param {string} [defaultMessage='An unexpected error occurred'] - Default message if not provided
	 * @returns {ApiError} ApiError instance
	 */
	static from(
		error,
		defaultStatusCode = 500,
		defaultMessage = "An unexpected error occurred",
	) {
		// If already an ApiError, return as is
		if (error instanceof ApiError) {
			return error
		}

		// Determine if this is likely a programming error based on error type
		const isProgrammingError =
			error instanceof TypeError ||
			error instanceof ReferenceError ||
			error instanceof SyntaxError

		const category = isProgrammingError
			? ERROR_CATEGORIES.PROGRAMMING
			: ERROR_CATEGORIES.OPERATIONAL

		// Convert to ApiError
		return new ApiError(
			defaultStatusCode,
			error.message || defaultMessage,
			[],
			error.stack,
			false,
			null, // Will be mapped from status code
			category,
			{ originalError: error.name },
		)
	}
}

export default ApiError
