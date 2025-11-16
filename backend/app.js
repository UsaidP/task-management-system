import cookieParser from "cookie-parser"
import cors from "cors"
import express, { urlencoded } from "express"

const app = express()
const allowedOrigins = [
	"https://task-management-system-frontend1.onrender.com",
	"https://task-management-system-frontend-ha2z.onrender.com",
	"https://task-management-system-backend-bjqp.onrender.com",
	"http://localhost:5173", // For local testing
	"http://localhost:3000",
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
	credentials: true, // Critical for cookies
	exposedHeaders: ["Set-Cookie"],
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
	optionsSuccessStatus: 200, // For legacy browsers
	origin: (origin, callback) => {
		if (!origin) return callback(null, true)

		if (allowedOrigins.includes(origin)) {
			return callback(null, true)
		} else {
			console.log("Blocked origin:", origin) // Debug log
			return callback(new Error("Not allowed by CORS"))
		}
	},
}

// 2. Use these exact options for BOTH preflight and main requests
app.options("*", cors(corsOptions)) // Handle preflight requests
app.use(cors(corsOptions)) // Handle all other requests
// --- End of Fix ---

// Standard middleware
app.use(express.json())
app.use(urlencoded({ extended: true }))
app.use(cookieParser())

// Router imports
import userRouter from "./src/routes/auth.route.js"
import dashboardRoute from "./src/routes/dashboard.route.js"
import healthCheck from "./src/routes/healthcheck.route.js"
import noteRouter from "./src/routes/note.route.js"
import projectRouter from "./src/routes/project.route.js"
import projectMemberRoute from "./src/routes/projectMember.route.js"
import subtaskRouter from "./src/routes/subtask.route.js"
import taskRouter from "./src/routes/task.route.js"

// Route definitions
if (process.env.NODE_ENV !== "test") {
	app.use("/api/v1/healthcheck", healthCheck)
}
app.use("/api/v1/users", userRouter)
app.use("/api/v1/projects", projectRouter)
app.use("/api/v1/tasks", taskRouter)
app.use("/api/v1/notes", noteRouter)
app.use("/api/v1/members", projectMemberRoute)
app.use("/api/v1/subtasks", subtaskRouter)
app.use("/api/v1/dashboard", dashboardRoute)

export default app
