import { Router } from "express";
import { authMiddleware } from "../auth/middleware";
import * as commentsController from "../controllers/comments.controller";

const router = Router();
router.use(authMiddleware);

router.get("/:taskId/comments", commentsController.getComments);
router.post("/:taskId/comments", commentsController.addComment);

export default router;
