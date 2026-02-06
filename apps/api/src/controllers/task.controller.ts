
import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/task.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { createTaskSchema, updateTaskSchema } from '../validation/task.schema';

// Board Handler
export const getMyBoard = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const board = taskService.getBoard(req.user!.userId);
    res.json(board);
  } catch (error) {
    next(error);
  }
};

export const getTasks = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { columnId } = req.params;
    const tasks = taskService.getTasks(Number(columnId));
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { columnId } = req.params;
    const data = createTaskSchema.parse(req.body);
    const task = taskService.createTask(Number(columnId), data);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    const data = updateTaskSchema.parse(req.body);
    const task = taskService.updateTask(Number(taskId), data);
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    taskService.deleteTask(Number(taskId));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};