import { Router } from "express";
import {
  addMember,
  projectMemberController,
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
router.route("/update/:projectId").post(protect, updateMember);
router.route("/remove/:projectId").post(protect, removeMember);
router
  .route("/all-members/:projectId")
  .get(
    protect,
    validateProjectPermission(["admin"]),
    projectMemberController.getAllMembers
  );
export default router;
