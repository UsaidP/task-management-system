import fs from "fs"
import morgan from "morgan"
import path from "path"
import winston from "winston"
import "winston-daily-rotate-file"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create logs directory if it doesn't exist
const logDir = path.resolve(__dirname, "../../logs")
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir, { recursive: true })
}

/**
 * Winston Logger Configuration
 * Multi-transport logger with file rotation and console output
 */
const logger = winston.createLogger({
	defaultMeta: { service: "taskflow-api" },
	format: winston.format.combine(
		winston.format.timestamp({
			format: "YYYY-MM-DD HH:mm:ss",
		}),
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		winston.format.json(),
	),
	level: process.env.LOG_LEVEL || "info",
	transports: [
		// Error logs - rotated daily, kept for 30 days
		new winston.transports.DailyRotateFile({
			datePattern: "YYYY-MM-DD",
			filename: path.join(logDir, "error-%DATE%.log"),
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
					return `${timestamp} [${level.toUpperCase()}] ${message} ${
						stack ? "\n" + stack : ""
					} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`
				}),
			),
			level: "error",
			maxFiles: "30d",
			maxSize: "20m",
		}),

		// Combined logs - rotated daily, kept for 14 days
		new winston.transports.DailyRotateFile({
			datePattern: "YYYY-MM-DD",
			filename: path.join(logDir, "combined-%DATE%.log"),
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
					return `${timestamp} [${level.toUpperCase()}] ${message} ${
						stack ? "\n" + stack : ""
					} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`
				}),
			),
			maxFiles: "14d",
			maxSize: "20m",
		}),
	],
})

// Add console transport in development
if (process.env.NODE_ENV !== "production") {
	logger.add(
		new winston.transports.Console({
			format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
		}),
	)
}

/**
 * Morgan HTTP Request Logger
 * Logs all incoming HTTP requests with detailed information
 */
const httpLogger = morgan(
	// Custom token for request ID
	":method :url :status :res[content-length] - :response-time ms",
	{
		skip: (req, res) => {
			// Skip health check endpoints in production
			if (process.env.NODE_ENV === "production") {
				return req.url === "/api/v1/healthcheck"
			}
			return false
		},
		stream: {
			write: (message) => {
				logger.http(message.trim())
			},
		},
	},
)

/**
 * Custom Morgan token for request ID
 * Generates or retrieves unique request ID for tracing
 */
morgan.token("id", (req) => {
	if (!req.id) {
		req.id = Math.random().toString(36).substring(2, 15)
	}
	return req.id
})

/**
 * Request logging middleware with detailed information
 * Should be used early in the middleware chain
 */
const requestLogger = (req, res, next) => {
	const start = Date.now()
	const requestId = Math.random().toString(36).substring(2, 15)

	req.id = requestId
	req.startTime = start

	// Log request details
	logger.info({
		ip: req.ip,
		method: req.method,
		requestId,
		timestamp: new Date().toISOString(),
		type: "request",
		url: req.url,
		userAgent: req.get("user-agent"),
	})

	// Log response on finish
	res.on("finish", () => {
		const duration = Date.now() - start
		const logLevel = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info"

		logger.log(logLevel, {
			duration: `${duration}ms`,
			method: req.method,
			requestId,
			statusCode: res.statusCode,
			timestamp: new Date().toISOString(),
			type: "response",
			url: req.url,
		})
	})

	next()
}

/**
 * Error logging middleware
 * Logs errors with full stack traces and context
 */
const errorLogger = (err, req, res, next) => {
	logger.error({
		error: {
			message: err.message,
			name: err.name,
			stack: err.stack,
			statusCode: err.statusCode,
		},
		method: req.method,
		requestId: req.id,
		timestamp: new Date().toISOString(),
		type: "error",
		url: req.url,
		user: req.user?._id || "anonymous",
	})

	next(err)
}

export { logger, httpLogger, requestLogger, errorLogger }
