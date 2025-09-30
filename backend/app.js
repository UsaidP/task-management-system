import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: [process.env.BASE_URL, "http://localhost:5173"], // kahase request aane dena chahtahu mai.
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

//Router imports
import healthCheck from "./src/routes/healthcheck.route.js";
import userRouter from "./src/routes/auth.route.js";
import projectRouter from "./src/routes/project.route.js";
import taskRouter from "./src/routes/task.route.js";
import noteRouter from "./src/routes/note.route.js";
import projectMemberRoute from "./src/routes/projectMember.route.js";
import subtaskRouter from "./src/routes/subtask.route.js";
app.use("/api/v1/healthcheck", healthCheck);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/notes", noteRouter);
app.use("/api/v1/members", projectMemberRoute);
app.use("/api/v1/subtasks", subtaskRouter);

export default app;
