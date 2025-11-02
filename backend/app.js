import cookieParser from "cookie-parser"
import cors from "cors"
import express, { urlencoded } from "express"

const app = express()

const allowedOrigin = 'https://task-management-system-frontend1.onrender.com';

// 2. Create your CORS options object
const corsOptions = {
  origin: allowedOrigin,
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  credentials: true, // This is necessary for cookies/auth tokens
  allowedHeaders: "Content-Type,Authorization,X-Requested-With,Accept"
};

// 3. Handle preflight requests
// This fixes the "Response to preflight request" error
app.options('*', cors(corsOptions));

// 4. Use the CORS middleware for all other requests
app.use(cors(corsOptions));

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
