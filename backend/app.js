import cookieParser from "cookie-parser"
import cors from "cors"
import express, { urlencoded } from "express"

const app = express()
const allowedOrigins = [
  "https://task-management-system-frontend1.onrender.com",
]

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      } else {
        return callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
  })
)

// Handle preflight requests globally
app.options("*", cors())

app.use(express.json())
app.use(urlencoded({ extended: true }))
app.use(cookieParser())

import userRouter from "./src/routes/auth.route.js"
import dashboardRoute from "./src/routes/dashboard.route.js"
//Router imports
import healthCheck from "./src/routes/healthcheck.route.js"
import noteRouter from "./src/routes/note.route.js"
import projectRouter from "./src/routes/project.route.js"
import projectMemberRoute from "./src/routes/projectMember.route.js"
import subtaskRouter from "./src/routes/subtask.route.js"
import taskRouter from "./src/routes/task.route.js"

if (process.env.NODE_ENV !== 'test') {
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
