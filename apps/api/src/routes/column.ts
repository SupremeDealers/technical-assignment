import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as columnController from "../controllers/column";
import * as taskController from "../controllers/task";

const router = Router();

router.use(authMiddleware);

router.patch("/:columnId", columnController.updateColumn);
router.delete("/:columnId", columnController.deleteColumn);
router.get("/:columnId/tasks", taskController.getTasks);
router.post("/:columnId/tasks", taskController.createTask);

export default router;
