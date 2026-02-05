import * as columnRepository from "../repositories/column.repository";
import * as taskRepository from "../repositories/task.repository";
import type { Task, TaskListResult } from "../types/entities";

export type TaskQueryInput = {
  search?: string;
  page?: number;
  limit?: number;
  sort?: "createdAt" | "priority";
};

export function getTasks(columnId: number, query: TaskQueryInput): TaskListResult {
  if (!columnRepository.findById(columnId)) {
    throw { code: "NOT_FOUND" as const, message: "Column not found" };
  }
  return taskRepository.findByColumnId({
    columnId,
    search: query.search ?? "",
    page: query.page ?? 1,
    limit: query.limit ?? 20,
    sort: query.sort ?? "createdAt",
  });
}

export type CreateTaskInput = { title: string; description?: string; priority?: string };

export function createTask(columnId: number, input: CreateTaskInput, userId: number): Task {
  if (!columnRepository.findById(columnId)) {
    throw { code: "NOT_FOUND" as const, message: "Column not found" };
  }
  return taskRepository.create({
    columnId,
    title: input.title,
    description: input.description ?? null,
    priority: input.priority ?? "medium",
    createdBy: userId,
  });
}

export function getTask(taskId: number): Task {
  const task = taskRepository.findById(taskId);
  if (!task) {
    throw { code: "NOT_FOUND" as const, message: "Task not found" };
  }
  return task;
}

export type PatchTaskInput = {
  title?: string;
  description?: string | null;
  priority?: string;
  columnId?: number;
};

export function updateTask(taskId: number, input: PatchTaskInput): Task {
  if (input.columnId !== undefined) {
    if (!columnRepository.findById(input.columnId)) {
      throw { code: "NOT_FOUND" as const, message: "Target column not found" };
    }
  }
  const task = taskRepository.update(taskId, input);
  if (!task) {
    throw { code: "NOT_FOUND" as const, message: "Task not found" };
  }
  return task;
}

export function deleteTask(taskId: number): void {
  const deleted = taskRepository.deleteById(taskId);
  if (!deleted) {
    throw { code: "NOT_FOUND" as const, message: "Task not found" };
  }
}
