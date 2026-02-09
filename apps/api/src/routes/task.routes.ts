import type { Router, Response } from "express";
import type { AuthRequest } from "../auth";
import { authMiddleware } from "../auth";
import { prisma } from "../db";
import { sendError } from "../errors";

export function registerTaskRoutes(app: Router) {
  // Create a new task
  app.post(
    "/boards/:boardId/tasks",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId!;
        const { boardId } = req.params;
        const { title, description, columnId, position } = req.body;

        if (!title || !columnId) {
          sendError(res, 400, {
            code: "BAD_REQUEST",
            message: "Missing required fields: title, columnId",
          });
          return;
        }

        // Verify board ownership
        const board = await prisma.board.findUnique({
          where: { id: boardId },
        });

        if (!board) {
          sendError(res, 404, {
            code: "NOT_FOUND",
            message: "Board not found",
          });
          return;
        }

        if (board.userId !== userId) {
          sendError(res, 403, {
            code: "FORBIDDEN",
            message: "You don't have access to this board",
          });
          return;
        }

        // Verify column exists and belongs to the board
        const column = await prisma.column.findUnique({
          where: { id: columnId },
        });

        if (!column || column.boardId !== boardId) {
          sendError(res, 400, {
            code: "BAD_REQUEST",
            message: "Invalid column",
          });
          return;
        }

        // Get next position if not provided
        const taskCount = await prisma.task.count({
          where: { columnId },
        });

        const task = await prisma.task.create({
          data: {
            title,
            description: description || null,
            position: position ?? taskCount,
            boardId,
            columnId,
            userId,
          },
          include: {
            user: true,
            comments: true,
          },
        });

        res.status(201).json({ task });
      } catch (error) {
        console.error("Create task error:", error);
        sendError(res, 500, {
          code: "INTERNAL",
          message: "Failed to create task",
        });
      }
    }
  );

  // Get all tasks for a board with optional search and pagination
  app.get(
    "/boards/:boardId/tasks",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId!;
        const { boardId } = req.params;
        const { search = "", page = "1", limit = "50" } = req.query;

        // Verify board ownership
        const board = await prisma.board.findUnique({
          where: { id: boardId },
        });

        if (!board) {
          sendError(res, 404, {
            code: "NOT_FOUND",
            message: "Board not found",
          });
          return;
        }

        if (board.userId !== userId) {
          sendError(res, 403, {
            code: "FORBIDDEN",
            message: "You don't have access to this board",
          });
          return;
        }

        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
        const skip = (pageNum - 1) * limitNum;

        const whereClause = {
          boardId,
          title: {
            contains: (search as string) || "",
            mode: "insensitive" as const,
          },
        };

        const [tasks, total] = await Promise.all([
          prisma.task.findMany({
            where: whereClause,
            include: {
              user: true,
              comments: {
                orderBy: { createdAt: "desc" },
              },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limitNum,
          }),
          prisma.task.count({ where: whereClause }),
        ]);

        res.json({
          tasks,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        });
      } catch (error) {
        console.error("Get tasks error:", error);
        sendError(res, 500, {
          code: "INTERNAL",
          message: "Failed to fetch tasks",
        });
      }
    }
  );

  // Get a single task
  app.get(
    "/tasks/:taskId",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId!;
        const { taskId } = req.params;

        const task = await prisma.task.findUnique({
          where: { id: taskId },
          include: {
            user: true,
            board: true,
            column: true,
            comments: {
              orderBy: { createdAt: "desc" },
              include: { user: true },
            },
          },
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

        res.json({ task });
      } catch (error) {
        console.error("Get task error:", error);
        sendError(res, 500, {
          code: "INTERNAL",
          message: "Failed to fetch task",
        });
      }
    }
  );

  // Update a task
  app.put(
    "/tasks/:taskId",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId!;
        const { taskId } = req.params;
        const { title, description, columnId, position } = req.body;

        const task = await prisma.task.findUnique({
          where: { id: taskId },
          include: { board: true, column: true },
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

        // If moving to a different column, verify it exists and belongs to the board
        if (columnId && columnId !== task.columnId) {
          const newColumn = await prisma.column.findUnique({
            where: { id: columnId },
          });

          if (!newColumn || newColumn.boardId !== task.boardId) {
            sendError(res, 400, {
              code: "BAD_REQUEST",
              message: "Invalid column",
            });
            return;
          }
        }

        const updatedTask = await prisma.task.update({
          where: { id: taskId },
          data: {
            title: title !== undefined ? title : task.title,
            description: description !== undefined ? description : task.description,
            columnId: columnId || task.columnId,
            position: position !== undefined ? position : task.position,
          },
          include: {
            user: true,
            comments: {
              orderBy: { createdAt: "desc" },
            },
          },
        });

        res.json({ task: updatedTask });
      } catch (error) {
        console.error("Update task error:", error);
        sendError(res, 500, {
          code: "INTERNAL",
          message: "Failed to update task",
        });
      }
    }
  );

  // Delete a task
  app.delete(
    "/tasks/:taskId",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId!;
        const { taskId } = req.params;

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

        await prisma.task.delete({
          where: { id: taskId },
        });

        res.json({ success: true });
      } catch (error) {
        console.error("Delete task error:", error);
        sendError(res, 500, {
          code: "INTERNAL",
          message: "Failed to delete task",
        });
      }
    }
  );
}
