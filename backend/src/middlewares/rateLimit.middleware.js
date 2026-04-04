import rateLimit from "express-rate-limit"
import ApiError from "../utils/api-error.js"

/**
 * Rate Limiting Configuration
 * Multiple strategies for different use cases
 */

/**
 * Strict limiter for authentication endpoints
 * Prevents brute force attacks on login/register
 */
const authLimiter = rateLimit({
  keyGenerator: (req) => req.ip, // Track by IP
  legacyHeaders: false,
  max: 5, // 5 attempts per window
  message: new ApiError(
    429,
    "Too many authentication attempts from this IP, please try again after 15 minutes",
    [],
  ).toJSON(),
  standardHeaders: true,
  windowMs: 15 * 60 * 1000, // 15 minutes
})

/**
 * General API limiter for all routes
 * Prevents abuse and DoS attacks
 */
const apiLimiter = rateLimit({
  keyGenerator: (req) => req.ip,
  legacyHeaders: false,
  max: 1000, // 500 requests per window (SPAs + StrictMode fire many parallel requests)
  message: new ApiError(
    429,
    "Too many requests from this IP, please try again after 10 minutes",
    [],
  ).toJSON(),
  skip: (req) => {
    // Skip for health checks
    if (req.url === "/api/v1/healthcheck") return true
    return false
  },
  standardHeaders: true,
  windowMs: 10 * 60 * 1000, // 10 minutes
})

/**
 * Strict limiter for sensitive operations
 * Password reset, email verification, etc.
 */
const strictLimiter = rateLimit({
  keyGenerator: (req) => req.ip,
  legacyHeaders: false,
  max: 3, // Only 3 attempts
  message: new ApiError(429, "Too many attempts. Please try again after 30 minutes", []).toJSON(),
  standardHeaders: true,
  windowMs: 30 * 60 * 1000, // 30 minutes
})

/**
 * Limiter for write operations (POST, PUT, DELETE)
 * More restrictive than read operations
 */
const writeLimiter = rateLimit({
  keyGenerator: (req) => req.ip,
  legacyHeaders: false,
  max: 30, // 30 write operations per window
  message: new ApiError(429, "Too many write operations. Please slow down.", []).toJSON(),
  skip: (req) => {
    // Only apply to write methods
    return ["GET", "HEAD", "OPTIONS"].includes(req.method)
  },
  standardHeaders: true,
  windowMs: 5 * 60 * 1000, // 5 minutes
})

/**
 * Limiter for search/query endpoints
 * Prevents expensive query abuse
 */
const searchLimiter = rateLimit({
  keyGenerator: (req) => req.ip,
  legacyHeaders: false,
  max: 20, // 20 searches per window
  message: new ApiError(
    429,
    "Too many search requests. Please try again after 5 minutes",
    [],
  ).toJSON(),
  standardHeaders: true,
  windowMs: 5 * 60 * 1000, // 5 minutes
})

/**
 * Rate limit by user ID (for authenticated requests)
 * More granular than IP-based limiting
 */
const userLimiter = rateLimit({
  keyGenerator: (req) => req.user?._id?.toString() || req.ip, // Use user ID if available
  legacyHeaders: false,
  max: 200, // 200 requests per user per window
  message: new ApiError(429, "Too many requests. Please slow down.", []).toJSON(),
  standardHeaders: true,
  windowMs: 10 * 60 * 1000, // 10 minutes
})

export { apiLimiter, authLimiter, searchLimiter, strictLimiter, userLimiter, writeLimiter }
