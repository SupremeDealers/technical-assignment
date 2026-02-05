import type { Request, Response } from "express";
import { sendError } from "../errors";
import { parseBody, parseQuery } from "../validation/parse";
import {
  createTaskBodySchema,
  patchTaskBodySchema,
  taskQuerySchema,
} from "../validation/tasks";
import type { AuthLocals } from "../auth/middleware";
import * as taskService from "../services/task.service";

function parseColumnId(req: Request): number | null {
  const id = Number(req.params.columnId);
  return Number.isInteger(id) && id >= 1 ? id : null;
}

function parseTaskId(req: Request): number | null {
  const id = Number(req.params.taskId);
  return Number.isInteger(id) && id >= 1 ? id : null;
}

export function getTasks(req: Request, res: Response): void {
  const columnId = parseColumnId(req);
  if (columnId === null) {
    sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid column id" });
    return;
  }
  const query = parseQuery(res, taskQuerySchema, req.query);
  if (query === undefined) return;
  try {
    const result = taskService.getTasks(columnId, query);
    res.json(result);
  } catch (err) {
    if (err && typeof err === "object" && (err as { code: string }).code === "NOT_FOUND") {
      sendError(res, 404, { code: "NOT_FOUND", message: "Column not found" });
      return;
    }
    throw err;
  }
}

export function createTask(req: Request, res: Response): void {
  const columnId = parseColumnId(req);
  if (columnId === null) {
    sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid column id" });
    return;
  }
  const body = parseBody(res, createTaskBodySchema, req.body);
  if (body === undefined) return;
  const { userId } = (res as unknown as { locals: AuthLocals }).locals;
  try {
    const task = taskService.createTask(columnId, body, userId);
    res.status(201).json(task);
  } catch (err) {
    if (err && typeof err === "object" && (err as { code: string }).code === "NOT_FOUND") {
      sendError(res, 404, { code: "NOT_FOUND", message: "Column not found" });
      return;
    }
    throw err;
  }
}

export function getTask(req: Request, res: Response): void {
  const taskId = parseTaskId(req);
  if (taskId === null) {
    sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid task id" });
    return;
  }
  try {
    const task = taskService.getTask(taskId);
    res.json(task);
  } catch (err) {
    if (err && typeof err === "object" && (err as { code: string }).code === "NOT_FOUND") {
      sendError(res, 404, { code: "NOT_FOUND", message: "Task not found" });
      return;
    }
    throw err;
  }
}

export function patchTask(req: Request, res: Response): void {
  const taskId = parseTaskId(req);
  if (taskId === null) {
    sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid task id" });
    return;
  }
  const body = parseBody(res, patchTaskBodySchema, req.body);
  if (body === undefined) return;
  try {
    const task = taskService.updateTask(taskId, body);
    res.json(task);
  } catch (err) {
    if (err && typeof err === "object" && (err as { code: string }).code === "NOT_FOUND") {
      sendError(res, 404, { code: "NOT_FOUND", message: (err as { message: string }).message });
      return;
    }
    throw err;
  }
}

export function deleteTask(req: Request, res: Response): void {
  const taskId = parseTaskId(req);
  if (taskId === null) {
    sendError(res, 400, { code: "BAD_REQUEST", message: "Invalid task id" });
    return;
  }
  try {
    taskService.deleteTask(taskId);
    res.status(204).send();
  } catch (err) {
    if (err && typeof err === "object" && (err as { code: string }).code === "NOT_FOUND") {
      sendError(res, 404, { code: "NOT_FOUND", message: "Task not found" });
      return;
    }
    throw err;
  }
}
