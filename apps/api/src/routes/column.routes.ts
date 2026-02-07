import type { Router, Response } from "express";
import type { AuthRequest } from "../auth";
import { authMiddleware } from "../auth";
import { prisma } from "../db";
import { sendError } from "../errors";

export function registerColumnRoutes(app: Router) {
  // Create a new column
  app.post(
    "/boards/:boardId/columns",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId!;
        const { boardId } = req.params;
        const { title, position } = req.body;

        if (!title) {
          sendError(res, 400, {
            code: "BAD_REQUEST",
            message: "Missing required field: title",
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

        // Get next position if not provided
        const columnCount = await prisma.column.count({
          where: { boardId },
        });

        const column = await prisma.column.create({
          data: {
            title,
            position: position ?? columnCount,
            boardId,
          },
        });

        res.status(201).json({ column });
      } catch (error) {
        console.error("Create column error:", error);
        sendError(res, 500, {
          code: "INTERNAL",
          message: "Failed to create column",
        });
      }
    }
  );

  // Update a column
  app.put(
    "/columns/:columnId",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId!;
        const { columnId } = req.params;
        const { title, position } = req.body;

        const column = await prisma.column.findUnique({
          where: { id: columnId },
          include: { board: true },
        });

        if (!column) {
          sendError(res, 404, {
            code: "NOT_FOUND",
            message: "Column not found",
          });
          return;
        }

        if (column.board.userId !== userId) {
          sendError(res, 403, {
            code: "FORBIDDEN",
            message: "You don't have access to this column",
          });
          return;
        }

        const updatedColumn = await prisma.column.update({
          where: { id: columnId },
          data: {
            title: title !== undefined ? title : column.title,
            position: position !== undefined ? position : column.position,
          },
        });

        res.json({ column: updatedColumn });
      } catch (error) {
        console.error("Update column error:", error);
        sendError(res, 500, {
          code: "INTERNAL",
          message: "Failed to update column",
        });
      }
    }
  );

  // Delete a column
  app.delete(
    "/columns/:columnId",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId!;
        const { columnId } = req.params;

        const column = await prisma.column.findUnique({
          where: { id: columnId },
          include: { board: true },
        });

        if (!column) {
          sendError(res, 404, {
            code: "NOT_FOUND",
            message: "Column not found",
          });
          return;
        }

        if (column.board.userId !== userId) {
          sendError(res, 403, {
            code: "FORBIDDEN",
            message: "You don't have access to this column",
          });
          return;
        }

        await prisma.column.delete({
          where: { id: columnId },
        });

        res.json({ success: true });
      } catch (error) {
        console.error("Delete column error:", error);
        sendError(res, 500, {
          code: "INTERNAL",
          message: "Failed to delete column",
        });
      }
    }
  );
}
