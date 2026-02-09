import prisma from "../lib/prisma";

export class CommentService {
  async getTaskComments({
    task_id,
    user_id,
  }: {
    task_id: string;
    user_id: string;
  }) {
    // Check task ownership
    const task = await prisma.task.findUnique({
      where: { task_id },
      include: { column: true },
    });
    if (!task) throw new Error("Task not found");
    const board = await prisma.board.findUnique({
      where: {
        owner_id_board_id: {
          owner_id: user_id,
          board_id: task.column.board_id,
        },
      },
    });
    if (!board) throw new Error("Forbidden");
    return await prisma.comment.findMany({
      where: { task_id },
      orderBy: { created_at: "desc" },
      include: {
        author: {
          select: {
            user_id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async getCommentById({
    comment_id,
    user_id,
  }: {
    comment_id: string;
    user_id: string;
  }) {
    const comment = await prisma.comment.findUnique({
      where: { comment_id },
      include: { task: { include: { column: true } } },
    });
    if (!comment) throw new Error("Comment not found");
    const board = await prisma.board.findUnique({
      where: {
        owner_id_board_id: {
          owner_id: user_id,
          board_id: comment.task.column.board_id,
        },
      },
    });
    if (!board) throw new Error("Forbidden");
    return comment;
  }

  async createComment({
    task_id,
    author_id,
    user_id,
    content,
  }: {
    task_id: string;
    author_id: string;
    user_id: string;
    content: string;
  }) {
    // Check task ownership
    const task = await prisma.task.findUnique({
      where: { task_id },
      include: { column: true },
    });
    if (!task) throw new Error("Task not found");
    const board = await prisma.board.findUnique({
      where: {
        owner_id_board_id: {
          owner_id: user_id,
          board_id: task.column.board_id,
        },
      },
    });
    if (!board) throw new Error("Forbidden");
    return await prisma.comment.create({
      data: {
        content,
        task_id,
        author_id,
      },
    });
  }

  async deleteComment({
    comment_id,
    user_id,
  }: {
    comment_id: string;
    user_id: string;
  }) {
    const comment = await prisma.comment.findUnique({
      where: { comment_id },
      include: { task: { include: { column: true } } },
    });
    if (!comment) throw new Error("Comment not found");
    const board = await prisma.board.findUnique({
      where: {
        owner_id_board_id: {
          owner_id: user_id,
          board_id: comment.task.column.board_id,
        },
      },
    });
    if (!board) throw new Error("Forbidden");
    await prisma.comment.delete({ where: { comment_id } });
    return { message: "Comment deleted successfully" };
  }
}
