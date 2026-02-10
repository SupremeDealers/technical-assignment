import { Router } from "express";
import { middleware } from "../middleware/middleware";
import { prisma } from "../utilities/db";
import { sendError } from "../errors";

export const commentRouter = Router();
commentRouter.use(middleware);

// DELETE /comments/:commentId - Delete a comment (only by owner)
commentRouter.delete("/:commentId", async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.userId;

        // check if comment belongs to user 
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        })

        if (!comment) {
            return sendError(res, 404, {
                code: 'NOT_FOUND',
                message: "Comment not found"
            })
        }
        if (comment.userId !== userId) {
            return sendError(res, 403, {
                code: "FORBIDDEN",
                message: "You can only delete your own comments"
            })
        }
        await prisma.comment.delete({
            where: { id: commentId }
        });
        res.json({ message: "Comment deleted successfully" })

    } catch (e) {
        console.error("Failed to delete comment", e);
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to delete comment"
        });
    }
})