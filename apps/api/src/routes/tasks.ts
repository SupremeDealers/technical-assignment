import { Router } from "express";
import { authMiddleware } from "../auth/middleware";
import * as tasksController from "../controllers/tasks.controller";

const router = Router();
router.use(authMiddleware);

router.get("/:columnId/tasks", tasksController.getTasks);
router.post("/:columnId/tasks", tasksController.createTask);

export default router;
