import { Router } from "express";
import { addMember } from "../controllers/projectMember.controller.js";

const router = Router();

router.route("/add/:projectId").post(addMember);
export default router;
