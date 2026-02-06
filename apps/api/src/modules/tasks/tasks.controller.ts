import { Request, Response } from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "./tasks.service";
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from "./tasks.schema";

export const getTasksHandler = async (req: Request, res: Response) => {
  const { columnId } = req.params;
  const userId = req.user!.id;

  const query = taskQuerySchema.parse(req.query);
  const result = await getTasks({
    columnId,
    userId,
    ...query,
  });

  res.json(result);
};

export const postTaskHandler = async (req: Request, res: Response) => {
  const { columnId } = req.params;
  const userId = req.user!.id;

  const data = createTaskSchema.parse(req.body);
  const task = await createTask(columnId, userId, data);

  res.status(201).json(task);
};

export const patchTaskHandler = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const userId = req.user!.id;

  const data = updateTaskSchema.parse(req.body);
  const task = await updateTask(taskId, userId, data);

  res.json(task);
};

export const deleteTaskHandler = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const userId = req.user!.id;

  await deleteTask(taskId, userId);
  res.status(204).send();
};
