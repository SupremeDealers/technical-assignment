import type { Router, Response } from "express";
import type { AuthRequest } from "../auth";
import { authMiddleware } from "../auth";
import { prisma } from "../db";
import { sendError } from "../errors";

export function registerCommentRoutes(app: Router) {
  // Create a comment on a task
  app.post(
    "/tasks/:taskId/comments",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId!;
        const { taskId } = req.params;
        const { content } = req.body;

        if (!content) {
          sendError(res, 400, {
            code: "BAD_REQUEST",
            message: "Missing required field: content",
          });
          return;
        }

        // Verify task exists and user has access
        const task = await prisma.task.findUnique({
          where: { id: taskId },
          include: { board: true },
        });

        if (!task) {
          sendError(res, 404, {
            code: "NOT_FOUND",
            message: "Task not found",
          });
          return;
        }

        if (task.board.userId !== userId) {
          sendError(res, 403, {
            code: "FORBIDDEN",
            message: "You don't have access to this task",
          });
          return;
        }

        const comment = await prisma.comment.create({
          data: {
            content,
            taskId,
            userId,
          },
          include: {
            user: true,
          },
        });

        res.status(201).json({ comment });
      } catch (error) {
        console.error("Create comment error:", error);
        sendError(res, 500, {
          code: "INTERNAL",
          message: "Failed to create comment",
        });
      }
    }
  );

  // Get all comments for a task
  app.get(
    "/tasks/:taskId/comments",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId!;
        const { taskId } = req.params;

        // Verify task exists and user has access
        const task = await prisma.task.findUnique({
          where: { id: taskId },
          include: { board: true },
        });

        if (!task) {
          sendError(res, 404, {
            code: "NOT_FOUND",
            message: "Task not found",
          });
          return;
        }

        if (task.board.userId !== userId) {
          sendError(res, 403, {
            code: "FORBIDDEN",
            message: "You don't have access to this task",
          });
          return;
        }

        const comments = await prisma.comment.findMany({
          where: { taskId },
          include: { user: true },
          orderBy: { createdAt: "asc" },
        });

        res.json({ comments });
      } catch (error) {
        console.error("Get comments error:", error);
        sendError(res, 500, {
          code: "INTERNAL",
          message: "Failed to fetch comments",
        });
      }
    }
  );

  // Update a comment
  app.put(
    "/comments/:commentId",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId!;
        const { commentId } = req.params;
        const { content } = req.body;

        if (!content) {
          sendError(res, 400, {
            code: "BAD_REQUEST",
            message: "Missing required field: content",
          });
          return;
        }

        const comment = await prisma.comment.findUnique({
          where: { id: commentId },
          include: { task: { include: { board: true } } },
        });

        if (!comment) {
          sendError(res, 404, {
            code: "NOT_FOUND",
            message: "Comment not found",
          });
          return;
        }

        if (comment.userId !== userId) {
          sendError(res, 403, {
            code: "FORBIDDEN",
            message: "You can only edit your own comments",
          });
          return;
        }

        const updatedComment = await prisma.comment.update({
          where: { id: commentId },
          data: { content },
          include: { user: true },
        });

        res.json({ comment: updatedComment });
      } catch (error) {
        console.error("Update comment error:", error);
        sendError(res, 500, {
          code: "INTERNAL",
          message: "Failed to update comment",
        });
      }
    }
  );

  // Delete a comment
  app.delete(
    "/comments/:commentId",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId!;
        const { commentId } = req.params;

        const comment = await prisma.comment.findUnique({
          where: { id: commentId },
          include: { task: { include: { board: true } } },
        });

        if (!comment) {
          sendError(res, 404, {
            code: "NOT_FOUND",
            message: "Comment not found",
          });
          return;
        }

        if (comment.userId !== userId) {
          sendError(res, 403, {
            code: "FORBIDDEN",
            message: "You can only delete your own comments",
          });
          return;
        }

        await prisma.comment.delete({
          where: { id: commentId },
        });

        res.json({ success: true });
      } catch (error) {
        console.error("Delete comment error:", error);
        sendError(res, 500, {
          code: "INTERNAL",
          message: "Failed to delete comment",
        });
      }
    }
  );
}
