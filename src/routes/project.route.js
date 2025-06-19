import { Router } from "express";
import {
  createProject,
  getAllProjects,
} from "../controllers/project.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import validator from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/create", validator, protect, asyncHandler(createProject));
router.get("/all-projects", protect, authorize, asyncHandler(getAllProjects));

export default router;
