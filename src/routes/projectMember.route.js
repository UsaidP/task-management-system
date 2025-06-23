import { Router } from "express";
import {
  addMember,
  removeMember,
  updateMember,
} from "../controllers/projectMember.controller.js";
import {
  protect,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/add/:projectId")
  .post(protect, validateProjectPermission(["admin"]), addMember);
router.route("/update/:projectId").post(updateMember);
router.route("/remove/:projectId").post(removeMember);
export default router;
