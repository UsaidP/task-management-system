import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: [process.env.BASE_URL, "http://localhost:3000"], // kahase request aane dena chahtahu mai.
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

app.use("/api/v1/healthcheck", healthCheck);
app.use("/api/v1/users", userRouter);

export default app;
