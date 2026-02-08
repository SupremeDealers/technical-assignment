import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as taskController from "../controllers/task";
import * as commentController from "../controllers/comment";

const router = Router();

router.use(authMiddleware);

router.get("/:taskId", taskController.getTask);
router.patch("/:taskId", taskController.updateTask);
router.delete("/:taskId", taskController.deleteTask);
router.get("/:taskId/comments", commentController.getComments);
router.post("/:taskId/comments", commentController.createComment);

export default router;
