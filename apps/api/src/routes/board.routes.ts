import type { Router, Response } from "express";
import type { AuthRequest } from "../auth";
import { authMiddleware } from "../auth";
import { prisma } from "../db";
import { sendError } from "../errors";

export function registerBoardRoutes(app: Router) {
  // Get all boards for the current user
  app.get("/boards", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;

      const boards = await prisma.board.findMany({
        where: { userId },
        include: {
          columns: {
            orderBy: { position: "asc" },
            include: {
              tasks: {
                orderBy: { position: "asc" },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ boards });
    } catch (error) {
      console.error("Get boards error:", error);
      sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to fetch boards",
      });
    }
  });

  // Get a single board by ID
  app.get(
    "/boards/:boardId",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId!;
        const { boardId } = req.params;

        const board = await prisma.board.findUnique({
          where: { id: boardId },
          include: {
            columns: {
              orderBy: { position: "asc" },
              include: {
                tasks: {
                  orderBy: { position: "asc" },
                  include: {
                    comments: {
                      orderBy: { createdAt: "desc" },
                      include: { user: true },
                    },
                  },
                },
              },
            },
          },
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

        res.json({ board });
      } catch (error) {
        console.error("Get board error:", error);
        sendError(res, 500, {
          code: "INTERNAL",
          message: "Failed to fetch board",
        });
      }
    }
  );

  // Create a new board
  app.post("/boards", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const { title } = req.body;

      if (!title) {
        sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Missing required field: title",
        });
        return;
      }

      const board = await prisma.board.create({
        data: {
          title,
          userId,
        },
      });

      res.status(201).json({ board });
    } catch (error) {
      console.error("Create board error:", error);
      sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to create board",
      });
    }
  });

  // Update a board
  app.put(
    "/boards/:boardId",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId!;
        const { boardId } = req.params;
        const { title } = req.body;

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

        const updatedBoard = await prisma.board.update({
          where: { id: boardId },
          data: {
            title: title || board.title,
          },
        });

        res.json({ board: updatedBoard });
      } catch (error) {
        console.error("Update board error:", error);
        sendError(res, 500, {
          code: "INTERNAL",
          message: "Failed to update board",
        });
      }
    }
  );

  // Delete a board
  app.delete(
    "/boards/:boardId",
    authMiddleware,
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId!;
        const { boardId } = req.params;

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

        await prisma.board.delete({
          where: { id: boardId },
        });

        res.json({ success: true });
      } catch (error) {
        console.error("Delete board error:", error);
        sendError(res, 500, {
          code: "INTERNAL",
          message: "Failed to delete board",
        });
      }
    }
  );
}
