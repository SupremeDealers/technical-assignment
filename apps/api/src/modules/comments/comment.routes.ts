import { Router } from "express";
import { getComments, addComment, deleteComment } from "./comment.controller";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.get("/task/:taskId", requireAuth, getComments);
router.post("/task/:taskId", requireAuth, addComment);
router.delete("/delete/:commentId", requireAuth, deleteComment);

export default router;
