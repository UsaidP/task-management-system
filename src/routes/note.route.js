import { Router } from "express";

import { createNotes, getNotes } from "../controllers/note.controller.js";
import { validateProjectPermission } from "../middlewares/auth.middleware.js";
import { UserRoleEnum } from "../utils/constants.js";

const router = Router();
router.get(
  "/:projectId",
  validateProjectPermission(UserRoleEnum.MEMBER),
  getNotes
);

router.post("/:projectId", (req, res) => {
  res.json({ message: "POST notes working", projectId: req.params.projectId });
});

export default router;
