import { Router } from "express";

const router = Router();

// Importing controllers
import { createTask } from "../controllers/task.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

router.post("/create", protect, createTask);
// router.post("/get-all-tasks", protect, getTasks);
// router.post("/update/:id", protect, updateTask);
// router.post("/delete/:id", protect, deleteTask);
export default router;
