import { Comment, Task, User } from "../models";
import { CreateCommentInput } from "../validators/comment.schema";
import { PaginationQuery } from "../validators/pagination.schema";
import boardService from "./board.service";
import { createError } from "../utils/createError";

const commentService = {
  async createComment(userId: string, taskId: string, data: CreateCommentInput) {
    const task = await Task.findByPk(taskId);

    if (!task) {
      throw createError(404, "Task not found");
    }

    const boardId = task.getDataValue("boardId") as string;

    // Verify board ownership
    await boardService.verifyBoardOwnership(userId, boardId);

    const comment = await Comment.create({
      content: data.content,
      taskId,
      userId,
    });

    const commentId = comment.getDataValue("id") as string;

    // Return comment with user info
    const commentWithUser = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return commentWithUser;
  },

  async getComments(userId: string, taskId: string, query: PaginationQuery) {
    const task = await Task.findByPk(taskId);

    if (!task) {
      throw createError(404, "Task not found");
    }

    const boardId = task.getDataValue("boardId") as string;

    // Verify board ownership
    await boardService.verifyBoardOwnership(userId, boardId);

    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const { rows: comments, count: total } = await Comment.findAndCountAll({
      where: { taskId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      comments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};

export default commentService;
