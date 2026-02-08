import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as commentController from "../controllers/comment";

const router = Router();

router.use(authMiddleware);

router.delete("/:commentId", commentController.deleteComment);

export default router;
