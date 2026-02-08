
import { Response, NextFunction } from 'express';
import * as taskService from '../services/task.service';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createColumnSchema,
  createTaskSchema,
  listTasksQuerySchema,
  updateColumnSchema,
  updateTaskSchema,
} from '../validation/task.schema';

// Board Handler
export const getMyBoard = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const board = taskService.getBoard(req.user!.userId);
    res.json(board);
  } catch (error) {
    next(error);
  }
};

export const getBoardById = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { boardId } = req.params;
    const board = taskService.getBoardById(req.user!.userId, Number(boardId));
    res.json(board);
  } catch (error) {
    next(error);
  }
};

export const getBoardColumns = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { boardId } = req.params;
    const columns = taskService.getBoardColumns(req.user!.userId, Number(boardId));
    res.json(columns);
  } catch (error) {
    next(error);
  }
};

export const createColumn = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { boardId } = req.params;
    const data = createColumnSchema.parse(req.body);
    const column = taskService.createColumn(req.user!.userId, Number(boardId), data);
    res.status(201).json(column);
  } catch (error) {
    next(error);
  }
};

export const updateColumn = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { columnId } = req.params;
    const data = updateColumnSchema.parse(req.body);
    const column = taskService.updateColumn(req.user!.userId, Number(columnId), data);
    res.json(column);
  } catch (error) {
    next(error);
  }
};

export const deleteColumn = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { columnId } = req.params;
    taskService.deleteColumn(req.user!.userId, Number(columnId));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getTasks = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { columnId } = req.params;
    const query = listTasksQuerySchema.parse(req.query);
    const result = taskService.getTasks(req.user!.userId, Number(columnId), query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getTask = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    const task = taskService.getTaskById(req.user!.userId, Number(taskId));
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const createTask = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { columnId } = req.params;
    const data = createTaskSchema.parse(req.body);
    const task = taskService.createTask(req.user!.userId, Number(columnId), data);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    const data = updateTaskSchema.parse(req.body);
    const task = taskService.updateTask(req.user!.userId, Number(taskId), data);
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    taskService.deleteTask(req.user!.userId, Number(taskId));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};