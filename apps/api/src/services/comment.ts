import { prisma } from "../lib/prisma";
import type { CreateCommentInput } from "../validators/comment";

export async function createComment(
  taskId: string,
  input: CreateCommentInput,
  userId: string
) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      column: {
        board: {
          ownerId: userId,
        },
      },
    },
  });

  if (!task) {
    return { error: "Task not found" };
  }

  const comment = await prisma.comment.create({
    data: {
      content: input.content,
      taskId,
      authorId: userId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return { comment };
}

export async function getCommentsByTask(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      column: {
        board: {
          ownerId: userId,
        },
      },
    },
  });

  if (!task) {
    return { error: "Task not found" };
  }

  const comments = await prisma.comment.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return { comments };
}

export async function deleteComment(commentId: string, userId: string) {
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      authorId: userId,
    },
  });

  if (!comment) {
    return { error: "Comment not found or not authorized" };
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  return { success: true };
}
