import compression from "compression"
import cookieParser from "cookie-parser"
import cors from "cors"
import express, { urlencoded } from "express"
import { cacheControl } from "./src/middlewares/cache-control.middleware.js"
import { errorLogger, httpLogger, requestLogger } from "./src/middlewares/logger.middleware.js"
import { apiLimiter } from "./src/middlewares/rateLimit.middleware.js"
import { requestId } from "./src/middlewares/request-id.middleware.js"
import { securityMiddleware } from "./src/middlewares/security.middleware.js"

// Router imports
import authRouter from "./src/routes/auth.route.js"
import dashboardRoute from "./src/routes/dashboard.route.js"
import emailRouter from "./src/routes/email.route.js"
import healthCheck from "./src/routes/healthcheck.route.js"
import noteRouter from "./src/routes/note.route.js"
import projectRouter from "./src/routes/project.route.js"
import projectMemberRoute from "./src/routes/projectMember.route.js"
import sprintRouter from "./src/routes/sprint.route.js"
import subtaskRouter from "./src/routes/subtask.route.js"
import taskRouter from "./src/routes/task.route.js"

const app = express()

// ============================================
// CORS Configuration
// ============================================
const allowedOrigins = [
	"http://localhost:5173",
	"http://localhost:5174",
  'task-management-system-eta-five.vercel.app',
  'https://task-management-system-usaidps-projects.vercel.app',
  'https://task-management-system-git-main-usaidps-projects.vercel.app',
  "https://task-management-system-eta-five.vercel.app",
	'https://task-management-system-dnrz.vercel.app', // Your main production Vercel URL
  'https://task-management-system-dnrz-ma84b65i9-usaidps-projects.vercel.app',
  'https://task-management-system-pme6gfv1l-usaidps-projects.vercel.app',
	"https://task-management-system-production-b964.up.railway.app",
	"https://glorious-stillness-production-0853.up.railway.app",
	// Support CORS_ORIGIN env var for flexible production config
	...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()) : []),
]

const corsOptions = {
	allowedHeaders: [
		"Content-Type",
		"Authorization",
		"X-Requested-With",
		"Accept",
		"Origin",
		"Access-Control-Request-Method",
		"Access-Control-Request-Headers",
	],
	credentials: true,
	exposedHeaders: ["Set-Cookie"],
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
	optionsSuccessStatus: 200,
	origin: (origin, callback) => {
		// Handle null/missing origin (server-to-server requests, healthchecks, etc.)
		if (!origin) {
			return callback(null, true)
		}

		if (allowedOrigins.includes(origin)) {
			return callback(null, true)
		}

		return callback(new Error("Not allowed by CORS"))
	},
}

// ============================================
// Middleware Chain (Order Matters!)
// ============================================

// Trust proxy only in production
if (process.env.NODE_ENV === "production") {
	app.set("trust proxy", 1)
}

// 1. Security headers and protection (first!)
app.use(...securityMiddleware)

// 2. Request ID for tracing
app.use(requestId)

// 3. Response compression
app.use(compression())

// 4. CORS configuration (before other middleware)
app.options("*", cors(corsOptions))
app.use(cors(corsOptions))

// 5. Body parsing middleware (BEFORE logging so req.body is available)
app.use(express.json({ limit: "10kb" }))
app.use(urlencoded({ extended: true, limit: "10kb" }))
app.use(cookieParser())

// 6. Request logging and monitoring (body now available in logs)
app.use(httpLogger)
app.use(requestLogger)

// 7. API-wide rate limiting
app.use("/api", apiLimiter)

// 8. Cache control for responses
app.use(cacheControl(60))

// ============================================
// Route Definitions
// ============================================
app.use("/api/v1/healthcheck", healthCheck)

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/projects", projectRouter)
app.use("/api/v1/tasks", taskRouter)
app.use("/api/v1/sprints", sprintRouter)
app.use("/api/v1/notes", noteRouter)
app.use("/api/v1/members", projectMemberRoute)
app.use("/api/v1/subtasks", subtaskRouter)
app.use("/api/v1/dashboard", dashboardRoute)

// Email testing routes (non-production only)
if (process.env.NODE_ENV !== "production") {
	app.use("/api/v1/email", emailRouter)
}

// ============================================
// 404 Handler for Unknown Routes
// ============================================
app.use((req, res, _next) => {
	if (res.headersSent) return
	res.status(404).json({
		errorCode: "ROUTE_NOT_FOUND",
		message: `Route ${req.originalUrl} not found`,
		success: false,
	})
})

// ============================================
// Global Error Handler
// ============================================
app.use(errorLogger)

app.use((err, _req, res, _next) => {
	const statusCode = err.statusCode || 500
	const message = err.message || "Internal Server Error"

	if (process.env.NODE_ENV === "development") {
		console.error("Error:", {
			errors: err.errors,
			message,
			name: err.name,
			stack: err.stack,
		})
	}

	res.status(statusCode).json({
		errors: err.errors || [],
		message,
		stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
		success: false,
		...(err.errorCode && { errorCode: err.errorCode }),
		...(err.timestamp && { timestamp: err.timestamp }),
	})
})

export default app
