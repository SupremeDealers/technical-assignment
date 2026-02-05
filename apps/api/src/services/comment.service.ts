import * as taskRepository from "../repositories/task.repository";
import * as commentRepository from "../repositories/comment.repository";
import type { Comment } from "../types/entities";

export function getComments(taskId: number): Comment[] {
  if (!taskRepository.findById(taskId)) {
    throw { code: "NOT_FOUND" as const, message: "Task not found" };
  }
  return commentRepository.findByTaskId(taskId);
}

export type CreateCommentInput = { body: string };

export function addComment(taskId: number, userId: number, input: CreateCommentInput): Comment {
  if (!taskRepository.findById(taskId)) {
    throw { code: "NOT_FOUND" as const, message: "Task not found" };
  }
  return commentRepository.create({
    taskId,
    userId,
    body: input.body,
  });
}
