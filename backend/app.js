import cookieParser from "cookie-parser"
import cors from "cors"
import express, { urlencoded } from "express"

const app = express()
const allowedOrigins = [
  "http://localhost:5173", // For local testing
  "http://localhost:4000", // For local testing
  "http://localhost:8080", // For local testing
  "https://task-management-system-production-3110.up.railway.app"
]

app.use(express.json());


// Add this Spy Middleware:
app.use((req, res, next) => {
  console.log(`🕵️ Incoming Request: ${req.method} ${req.url}`);
  next();
});

// Your routes should be below this:
// app.use("/api/v1/users", userRoutes);
// Add this Spy Middleware:
app.use((req, res, next) => {
  console.log(`🕵️ Incoming Request: ${req.method} ${req.url}`);
  next();
});

// Your routes should be below this:
// app.use("/api/v1/users", userRoutes);



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

// Route definitions
if (process.env.NODE_ENV !== "test") {
  app.use("/api/v1/healthcheck", healthCheck)
}
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", authRouter)
app.use("/api/v1/projects", projectRouter)
app.use("/api/v1/tasks", taskRouter)
app.use("/api/v1/sprints", sprintRouter)
app.use("/api/v1/notes", noteRouter)
app.use("/api/v1/members", projectMemberRoute)
app.use("/api/v1/subtasks", subtaskRouter)
app.use("/api/v1/dashboard", dashboardRoute)
app.use("/api/v1/email", emailRouter) // Email testing routes

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || "Internal Server Error"

  res.status(statusCode).json({
    errors: err.errors || [],
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    success: false,
  })
})

export default app
