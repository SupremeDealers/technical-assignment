import { Router } from "express";
import { middleware } from "../middleware/middleware";
import { prisma } from "../utilities/db";
import { sendError } from "../errors";
import { createBoardSchema, updateBoardSchema, createColumnSchema } from "../utilities/schema";
import { ZodError } from "zod";

export const boardRouter = Router();
boardRouter.use(middleware);

//get all the boards for the user
boardRouter.get("/", async (req, res) => {
    try {
        const boards = await prisma.board.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' },
            include: {
                columns: {
                    select: {
                        id: true,
                        name: true,
                        _count: {
                            select: { tasks: true }
                        }
                    }
                }
            }
        })
        res.json({ boards })
    } catch (e) {
        console.error('Failed to fetch boards', e)
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to fetch boards"
        })
    }
})

//create new board 
boardRouter.post("/", async (req, res) => {
    try {
        const { name } = createBoardSchema.parse(req.body);

        const board = await prisma.board.create({
            data: {
                name,
                userId: req.userId!
            }
        })
        res.status(201).json({
            message: "Board created successfully",
            board
        })
    } catch (e) {
        console.error("Failed to create the board", e);
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to create board"
        })
    }
})

//get a specific board by id
boardRouter.get("/:boardId", async (req, res) => {
    try {
        const { boardId } = req.params;

        const board = await prisma.board.findUnique({
            where: {
                id: boardId,
                userId: req.userId
            },
            include: {
                columns: {
                    orderBy: { position: "asc" },
                    include: {
                        tasks: {
                            orderBy: { position: "asc" },
                            include: {
                                _count: {
                                    select: { comments: true }
                                }
                            }
                        },
                        _count: {
                            select: { tasks: true }
                        }
                    }
                }
            }
        })

        if (!board) {
            return sendError(res, 404, {
                code: "NOT_FOUND",
                message: "Board Not found"
            })
        }

        res.json({ board })
    } catch (e) {
        console.error("Failed to fetch board", e);
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to fetch board"
        })
    }
})

//update a board
boardRouter.patch("/:boardId", async (req, res) => {
    try {
        const { boardId } = req.params;
        const data = updateBoardSchema.parse(req.body)

        const board = await prisma.board.update({
            where: {
                id: boardId,
                userId: req.userId
            },
            data
        })

        res.json({
            message: "Board updated successfully",
            board
        })
    } catch (e) {
        console.error("Failed to update the board", e);
        if (e instanceof ZodError) {
            return sendError(res, 400, {
                code: "VALIDATION",
                message: "Invalid board data"
            })
        }
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to update the board"
        })
    }
})

//delete a board
boardRouter.delete("/:boardId", async (req, res) => {
    try {
        const { boardId } = req.params;

        await prisma.board.delete({
            where: {
                id: boardId,
                userId: req.userId
            }
        });

        res.json({ message: "Board deleted successfully" });
    } catch (e) {
        console.error("Failed to delete board", e);
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to delete board"
        });
    }
})

// GET /boards/:boardId/columns - Get all columns for a board
boardRouter.get("/:boardId/columns", async (req, res) => {
    try {
        const { boardId } = req.params;

        const columns = await prisma.column.findMany({
            where: { boardId },
            orderBy: { position: 'asc' },
            include: {
                _count: {
                    select: { tasks: true }
                }
            }
        })
        res.json({ columns })
    } catch (e) {
        console.error("Failed to fetch columns", e);
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to fetch the columns"
        })
    }
})

// POST /boards/:boardId/columns - Create a new column
boardRouter.post("/:boardId/columns", async (req, res) => {
    try {
        const { boardId } = req.params;
        const { name, position } = createColumnSchema.parse(req.body);

        //if position not provided add to end
        let finalPosition = position;
        if (finalPosition === undefined) {
            const maxPosition = await prisma.column.findFirst({
                where: { boardId },
                orderBy: { position: 'desc' },
                select: { position: true }
            })
            finalPosition = maxPosition ? maxPosition.position + 1 : 0;
        }
        const column = await prisma.column.create({
            data: {
                boardId,
                name,
                position: finalPosition
            }
        })

        res.status(201).json({
            message: "Column created successfully",
            column
        })
    } catch (e) {
        console.error("Failed to create column", e)
        if (e instanceof ZodError) {
            return sendError(res, 400, {
                code: "VALIDATION",
                message: "Invalid column data"
            })
        }
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to create column"
        })
    }
})