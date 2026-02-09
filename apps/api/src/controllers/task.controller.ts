import { Request, Response, NextFunction } from "express";
import taskService from "../services/task.service";
import { sendSuccess } from "../utils/response";
import {
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
} from "../validators/task.schema";
import { PaginationQuery, paginationSchema } from "../validators/pagination.schema";

export const taskController = {
  createTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { columnId } = req.params;
      const data: CreateTaskInput = req.body;

      const task = await taskService.createTask(userId, columnId, data);

      sendSuccess(res, task, "Task created successfully", 201);
    } catch (error) {
      next(error);
    }
  },

  getTasks: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { boardId } = req.params;
      // const query: PaginationQuery = req.query;
      const query = paginationSchema.parse(req.query);


      const result = await taskService.getTasks(userId, boardId, query);

      sendSuccess(res, result, "Tasks retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  updateTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data: UpdateTaskInput = req.body;

      const task = await taskService.updateTask(userId, id, data);

      sendSuccess(res, task, "Task updated successfully");
    } catch (error) {
      next(error);
    }
  },

  deleteTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await taskService.deleteTask(userId, id);

      sendSuccess(res, result, "Task deleted successfully");
    } catch (error) {
      next(error);
    }
  },

  moveTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data: MoveTaskInput = req.body;

      const task = await taskService.moveTask(userId, id, data);

      sendSuccess(res, task, "Task moved successfully");
    } catch (error) {
      next(error);
    }
  },
};
