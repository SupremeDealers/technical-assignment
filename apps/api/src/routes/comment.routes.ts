import { Router } from "express";
import * as commentController from "../controllers/comment.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/tasks/:taskId/comments", commentController.getComments);
router.post("/tasks/:taskId/comments", commentController.createComment);

export default router;
