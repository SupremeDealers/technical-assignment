import { Router } from "express";
import { middleware } from "../middleware/middleware";
import { prisma } from "../utilities/db";
import { sendError } from "../errors";
import { updateColumnSchema, createTaskSchema, taskQuerySchema } from "../utilities/schema";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client";


export const columnRouter = Router();
columnRouter.use(middleware);

// PATCH /columns/:columnId - Update a column
columnRouter.patch('/:columnId', async (req, res) => {
    try {
        const { columnId } = req.params;
        const data = updateColumnSchema.parse(req.body)

        let column;

        if (data.position !== undefined) {
            // Handle reordering with transaction
            column = await prisma.$transaction(async (tx) => {
                const currentColumn = await tx.column.findUnique({
                    where: { id: columnId }
                });

                if (!currentColumn) {
                    throw new Error("Column not found");
                }

                const oldPosition = currentColumn.position;
                const newPosition = data.position;

                if (newPosition !== undefined && newPosition !== oldPosition) {
                    // Shift other columns
                    if (newPosition < oldPosition) {
                        // Moving left (e.g. 3 -> 0): increment others in [0, 3)
                        await tx.column.updateMany({
                            where: {
                                boardId: currentColumn.boardId,
                                position: {
                                    gte: newPosition,
                                    lt: oldPosition
                                },
                                id: { not: columnId }
                            },
                            data: {
                                position: { increment: 1 }
                            }
                        });
                    } else {
                        // Moving right (e.g. 0 -> 3): decrement others in (0, 3]
                        await tx.column.updateMany({
                            where: {
                                boardId: currentColumn.boardId,
                                position: {
                                    gt: oldPosition,
                                    lte: newPosition
                                },
                                id: { not: columnId }
                            },
                            data: {
                                position: { decrement: 1 }
                            }
                        });
                    }
                }

                return await tx.column.update({
                    where: { id: columnId },
                    data
                });
            });
        } else {
            // Simple update
            column = await prisma.column.update({
                where: { id: columnId },
                data
            })
        }

        res.json({
            message: "Column updated successfully",
            column
        })
    } catch (e) {
        console.error("Failed to update the column", e);

        if (e instanceof ZodError) {
            return sendError(res, 400, {
                code: "VALIDATION",
                message: "Invalid column data"
            })
        }
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to update column"
        })
    }
})

// DELETE /columns/:columnId - Delete a column
columnRouter.delete("/:columnId", async (req, res) => {
    try {
        const { columnId } = req.params;
        await prisma.column.delete({
            where: { id: columnId }
        })
        res.json({ message: "Column deleted successfully" })
    } catch (e) {
        console.error("Failed to delete column", e);
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to delete column"
        })
    }
})

// GET /columns/:columnId/tasks - Get all tasks for a column (with pagination & search)
columnRouter.get("/:columnId/tasks", async (req, res) => {
    try {
        const { columnId } = req.params;
        const { search, page, limit, sort } = taskQuerySchema.parse(req.query);

        // Build WHERE clause for filtering
        const where: Prisma.TaskWhereInput = {
            columnId
        }

        //search filters
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ]
        }
        // calculate the pagination
        const skip = (page - 1) * limit;
        //build orderBy
        const orderBy: Prisma.TaskOrderByWithRelationInput = sort === 'priority'
            ? { priority: 'desc' }
            : sort === 'updatedAt'
                ? { updatedAt: 'desc' }
                : { createdAt: 'desc' }

        //fetch task and total count
        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    _count: {
                        select: { comments: true }
                    }
                }
            }),
            prisma.task.count({ where })
        ])

        res.json({
            tasks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (e) {
        console.error("Failed to fetch the tasks", e);
        if (e instanceof ZodError) {
            return sendError(res, 400, {
                code: "VALIDATION",
                message: "Invalid query parameters",
                details: e.message
            })
        }
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to fetch tasks"
        })
    }
})

// POST /columns/:columnId/tasks - Create a new task
columnRouter.post("/:columnId/tasks", async (req, res) => {
    try {
        const { columnId } = req.params;
        const { title, description, position, priority } = createTaskSchema.parse(req.body);

        //if position not provided, add to end
        let finalPosition = position;
        if (finalPosition === undefined) {
            const maxPosition = await prisma.task.findFirst({
                where: { columnId },
                orderBy: { position: 'desc' },
                select: { position: true }
            })
            finalPosition = maxPosition ? maxPosition.position + 1 : 0;
        }
        const task = await prisma.task.create({
            data: {
                columnId,
                title,
                description,
                position: finalPosition,
                priority
            }
        })

        res.status(201).json({
            message: "Task created successfully",
            task
        });
    } catch (e) {
        console.error("Failed to create task", e);
        if (e instanceof ZodError) {
            return sendError(res, 400, {
                code: "VALIDATION",
                message: "Invalid task data",
                details: e.message
            });
        }
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to create task"
        });
    }
})
