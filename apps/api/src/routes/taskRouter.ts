import { Router } from "express";
import { middleware } from "../middleware/middleware";
import { prisma } from "../utilities/db";
import { updateTaskSchema, createCommentSchema } from "../utilities/schema";
import { ZodError } from "zod";
import { sendError } from "../errors";


export const taskRouter = Router()
taskRouter.use(middleware);

// GET /tasks/:taskId - Get a specific task with details
taskRouter.get("/:taskId", async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                column: {
                    select: {
                        id: true,
                        name: true,
                        boardId: true
                    }
                },
                comments: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        })

        if (!task) {
            return sendError(res, 404, {
                code: 'NOT_FOUND',
                message: "Task not found"
            })
        }

        res.json({ task })
    } catch (e) {
        console.error("Failed to fetch task", e);
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to fetch task"
        });
    }
})

// PATCH /tasks/:taskId - Update a task
taskRouter.patch('/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const data = updateTaskSchema.parse(req.body);

        const task = await prisma.task.update({
            where: { id: taskId },
            data
        })

        res.json({
            message: "Task updated successfully",
            task
        })
    } catch (e) {
        console.error("Failed to update task", e);
        if (e instanceof ZodError) {
            return sendError(res, 400, {
                code: "VALIDATION",
                message: "Invalid task data",
                details: e.message
            });
        }
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to update task"
        });
    }
})

// DELETE /tasks/:taskId - Delete a task
taskRouter.delete("/:taskId", async (req, res) => {
    try {
        const { taskId } = req.params;

        await prisma.task.delete({
            where: { id: taskId }
        });

        res.json({ message: "Task deleted successfully" });
    } catch (e) {
        console.error("Failed to delete task", e);
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to delete task"
        });
    }
})

// GET /tasks/:taskId/comments - Get all comments for a task
taskRouter.get("/:taskId/comments", async (req, res) => {
    try {
        const { taskId } = req.params;

        const comments = await prisma.comment.findMany({
            where: { taskId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        res.json({ comments })
    } catch (e) {
        console.error("Failed to fetch comments", e);
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to fetch comments"
        });
    }
})

// POST /tasks/:taskId/comments - Create a new comment
taskRouter.post("/:taskId/comments", async (req, res) => {
    try {
        const { taskId } = req.params;
        const { content } = createCommentSchema.parse(req.body);
        const userId = req.userId!;
        const comment = await prisma.comment.create({
            data: {
                taskId,
                userId,
                content
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        res.status(201).json({
            message: "Comment created successfully",
            comment
        })
    } catch (e) {
        console.error("Failed to create comment", e);
        if (e instanceof ZodError) {
            return sendError(res, 400, {
                code: "VALIDATION",
                message: "Invalid comment data",
                details: e.message
            });
        }
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to create comment"
        });
    }
})