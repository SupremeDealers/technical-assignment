import type { Request, Response } from "express";
import { sendError } from "../errors";
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from "../validators/task";
import { formatZodError } from "../lib/validation";
import { isError } from "../lib/result";
import * as taskService from "../services/task";

export async function createTask(req: Request, res: Response) {
  const result = createTaskSchema.safeParse(req.body);

  if (!result.success) {
    sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Invalid payload",
      details: formatZodError(result.error),
    });
    return;
  }

  const data = await taskService.createTask(
    req.params.columnId,
    result.data,
    req.user!.userId
  );

  if (isError(data)) {
    sendError(res, 404, {
      code: "NOT_FOUND",
      message: data.error,
    });
    return;
  }

  res.status(201).json(data);
}

export async function getTasks(req: Request, res: Response) {
  const queryResult = taskQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Invalid query parameters",
      details: formatZodError(queryResult.error),
    });
    return;
  }

  const data = await taskService.getTasksByColumn(
    req.params.columnId,
    queryResult.data,
    req.user!.userId
  );

  if (isError(data)) {
    sendError(res, 404, {
      code: "NOT_FOUND",
      message: data.error,
    });
    return;
  }

  res.json(data);
}

export async function getTask(req: Request, res: Response) {
  const task = await taskService.getTaskById(
    req.params.taskId,
    req.user!.userId
  );

  if (!task) {
    sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Task not found",
    });
    return;
  }

  res.json({ task });
}

export async function updateTask(req: Request, res: Response) {
  const result = updateTaskSchema.safeParse(req.body);

  if (!result.success) {
    sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Invalid payload",
      details: formatZodError(result.error),
    });
    return;
  }

  const data = await taskService.updateTask(
    req.params.taskId,
    result.data,
    req.user!.userId
  );

  if (isError(data)) {
    sendError(res, 404, {
      code: "NOT_FOUND",
      message: data.error,
    });
    return;
  }

  res.json(data);
}

export async function deleteTask(req: Request, res: Response) {
  const data = await taskService.deleteTask(
    req.params.taskId,
    req.user!.userId
  );

  if (isError(data)) {
    sendError(res, 404, {
      code: "NOT_FOUND",
      message: data.error,
    });
    return;
  }

  res.status(204).send();
}

export async function getBoardTasks(req: Request, res: Response) {
  const data = await taskService.getAllTasksForBoard(
    req.params.boardId,
    req.user!.userId
  );

  if (isError(data)) {
    sendError(res, 404, {
      code: "NOT_FOUND",
      message: data.error,
    });
    return;
  }

  res.json(data);
}
