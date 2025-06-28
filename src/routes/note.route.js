import { Router } from "express";

import {
  createNotes,
  deleteNote,
  getNoteById,
  getNotes,
  updateNote,
} from "../controllers/note.controller.js";
import {
  protect,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import { UserRoleEnum } from "../utils/constants.js";

const router = Router();
router
  .route("/:projectId/n/:noteId")
  .get(
    protect,
    validateProjectPermission([
      UserRoleEnum.MEMBER,
      UserRoleEnum.PROJECT_ADMIN,
      UserRoleEnum.ADMIN,
    ]),
    getNoteById
  )
  .put(
    protect,
    validateProjectPermission([UserRoleEnum.PROJECT_ADMIN, UserRoleEnum.ADMIN]),
    updateNote
  )
  .delete(
    protect,
    validateProjectPermission([UserRoleEnum.PROJECT_ADMIN, UserRoleEnum.ADMIN]),
    deleteNote
  );

router.post(
  "/:projectId",
  protect,
  validateProjectPermission([UserRoleEnum.ADMIN, UserRoleEnum.PROJECT_ADMIN]),
  createNotes
);

export default router;
