import { Router } from "express";

import {
  createNotes,
  getNoteById,
  getNotes,
} from "../controllers/note.controller.js";
import {
  protect,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import { UserRoleEnum } from "../utils/constants.js";

const router = Router();
router
  .get(
    "/:projectId/n/:noteId",
    protect,
    validateProjectPermission([
      UserRoleEnum.MEMBER,
      UserRoleEnum.PROJECT_ADMIN,
      UserRoleEnum.ADMIN,
    ]),
    getNoteById
  )
  .get(
    "/:noteId",
    protect,
    validateProjectPermission([
      UserRoleEnum.MEMBER,
      UserRoleEnum.PROJECT_ADMIN,
      UserRoleEnum.ADMIN,
    ]),
    getNoteById
  );
router.post(
  "/:projectId",
  protect,
  validateProjectPermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
  createNotes
);

export default router;
