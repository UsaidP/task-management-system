import rateLimit from "express-rate-limit"
import ApiError from "../utils/api-error.js"

/**
 * Rate Limiting Configuration
 * Multiple strategies for different use cases
 */

/**
 * Skip rate limiting in test environment to prevent
 * false positives from sequential test requests.
 */
const isTestEnv = () => process.env.NODE_ENV === "test"

/**
 * Strict limiter for authentication endpoints
 * Prevents brute force attacks on login/register
 */
const authLimiter = rateLimit({
	keyGenerator: (req) => req.ip,
	legacyHeaders: false,
	max: 5,
	message: new ApiError(
		429,
		"Too many authentication attempts from this IP, please try again after 15 minutes",
		[],
	).toJSON(),
	skip: isTestEnv,
	standardHeaders: true,
	windowMs: 15 * 60 * 1000,
})

/**
 * General API limiter for all routes
 * Prevents abuse and DoS attacks
 */
const apiLimiter = rateLimit({
	keyGenerator: (req) => req.ip,
	legacyHeaders: false,
	max: 1000,
	message: new ApiError(
		429,
		"Too many requests from this IP, please try again after 10 minutes",
		[],
	).toJSON(),
	skip: (req) => {
		if (isTestEnv()) return true
		if (req.url.startsWith("/api/v1/healthcheck")) return true
		return false
	},
	standardHeaders: true,
	windowMs: 10 * 60 * 1000,
})

/**
 * Strict limiter for sensitive operations
 * Password reset, email verification, etc.
 */
const strictLimiter = rateLimit({
	keyGenerator: (req) => req.ip,
	legacyHeaders: false,
	max: 3,
	message: new ApiError(429, "Too many attempts. Please try again after 30 minutes", []).toJSON(),
	skip: isTestEnv,
	standardHeaders: true,
	windowMs: 30 * 60 * 1000,
})

/**
 * Limiter for write operations (POST, PUT, DELETE)
 * More restrictive than read operations
 */
const writeLimiter = rateLimit({
	keyGenerator: (req) => req.ip,
	legacyHeaders: false,
	max: 30,
	message: new ApiError(429, "Too many write operations. Please slow down.", []).toJSON(),
	skip: (req) => {
		if (isTestEnv()) return true
		return ["GET", "HEAD", "OPTIONS"].includes(req.method)
	},
	standardHeaders: true,
	windowMs: 5 * 60 * 1000,
})

/**
 * Limiter for search/query endpoints
 * Prevents expensive query abuse
 */
const searchLimiter = rateLimit({
	keyGenerator: (req) => req.ip,
	legacyHeaders: false,
	max: 20,
	message: new ApiError(
		429,
		"Too many search requests. Please try again after 5 minutes",
		[],
	).toJSON(),
	skip: isTestEnv,
	standardHeaders: true,
	windowMs: 5 * 60 * 1000,
})

/**
 * Rate limit by user ID (for authenticated requests)
 * More granular than IP-based limiting
 */
const userLimiter = rateLimit({
	keyGenerator: (req) => req.user?._id?.toString() || req.ip,
	legacyHeaders: false,
	max: 200,
	message: new ApiError(429, "Too many requests. Please slow down.", []).toJSON(),
	skip: isTestEnv,
	standardHeaders: true,
	windowMs: 10 * 60 * 1000,
})

export { apiLimiter, authLimiter, searchLimiter, strictLimiter, userLimiter, writeLimiter }
