import express from "express";
import { authMiddleware } from "../auth/middleware";
import { sendError } from "../errors";
import { tasks } from "./tasks";

const router = express.Router();

// Temporary in-memory storage
interface Comment {
  id: number;
  content: string;
  taskId: number;
  userId: number;
  createdAt: string;
}

let comments: Comment[] = [
  {
    id: 1,
    content: "This is a sample comment",
    taskId: 1,
    userId: 1,
    createdAt: new Date().toISOString(),
  },
];

let nextCommentId = 2;

router.get("/tasks/:taskId/comments", authMiddleware, (req, res) => {
  const taskId = parseInt(req.params.taskId);
  const taskComments = comments.filter((c) => c.taskId === taskId);

  res.json(taskComments);
});

router.post("/tasks/:taskId/comments", authMiddleware, (req, res) => {
  const taskId = parseInt(req.params.taskId);
  const { content } = req.body;

  // Check if task exists
  const taskExists = tasks.some((t) => t.id === taskId);
  if (!taskExists) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Task not found",
    });
  }

  if (!content || content.trim() === "") {
    return sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Comment content is required",
    });
  }

  const comment: Comment = {
    id: nextCommentId++,
    content: content.trim(),
    taskId,
    userId: (req as any).user.userId,
    createdAt: new Date().toISOString(),
  };

  comments.push(comment);
  res.json(comment);
});

export default router;
