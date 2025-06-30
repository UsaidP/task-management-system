import { Router } from "express";
import {
  addMember,
  projectMemberController,
  removeMember,
  updateMember,
} from "../controllers/projectMember.controller.js";
import { protect, validateProjectPermission } from "../middlewares/auth.middleware.js";
import { UserRoleEnum } from "../utils/constants.js";

const router = Router();

router
  .route("/add/:projectId")
  .post(
    protect,
    validateProjectPermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
    addMember
  );
router
  .route("/update/:projectId")
  .post(
    protect,
    validateProjectPermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
    updateMember
  );
router
  .route("/remove/:projectId")
  .post(protect, validateProjectPermission([UserRoleEnum.ADMIN]), removeMember);
router
  .route("/all-members/:projectId")
  .get(
    protect,
    validateProjectPermission([UserRoleEnum.ADMIN]),
    projectMemberController.getAllMembers
  );
export default router;
