import { Router } from "express";
import { authMiddleware } from "../auth/middleware";
import * as tasksController from "../controllers/tasks.controller";

const router = Router();
router.use(authMiddleware);

router.get("/:taskId", tasksController.getTask);
router.patch("/:taskId", tasksController.patchTask);
router.delete("/:taskId", tasksController.deleteTask);

export default router;
