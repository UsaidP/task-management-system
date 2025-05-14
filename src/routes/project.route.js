import { Router } from "express";
import { createProject } from "../controllers/project.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.route("/create").post(asyncHandler(createProject));
export default router;
