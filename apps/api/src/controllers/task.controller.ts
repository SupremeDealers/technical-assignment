import { Response } from "express";
import { AuthRequest, TaskSearchQuery } from "../types";
import { sendError } from "../errors";
import {
  createTaskSchema,
  MoveTaskInput,
  moveTaskSchema,
  updateTaskSchema,
} from "../validators";
import { z, ZodError } from "zod";
import { TaskService } from "../services/task.service";

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  getTasks = async (req: AuthRequest, res: Response) => {
    try {
      const { columnId } = req.params;
      const { search, page, limit, priority } = req.query as TaskSearchQuery;
      const result = await this.taskService.searchTasks({
        column_id: columnId,
        user_id: req.user_id!,
        search,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        priority: priority === "" ? undefined : priority,
      });
      res.json(result);
    } catch (error) {
      return sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to fetch tasks",
      });
    }
  };

  getTask = async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.params;
      const task = await this.taskService.getTaskById({
        task_id: taskId,
        user_id: req.user_id!,
      });
      res.json(task);
    } catch (error) {
      if (error instanceof Error && error.message === "Task not found") {
        return sendError(res, 404, {
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }
      return sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to fetch task",
      });
    }
  };

  moveTask = async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.params;
      const body: MoveTaskInput = moveTaskSchema.parse(req.body);
      const task = await this.taskService.moveTask({
        task_id: taskId,
        user_id: req.user_id!,
        to_column_id: body.to_column_id,
        new_order: body.new_order,
      });
      res.status(200).json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Validation error",
          details: error.issues.map((e: any) => ({
            path: e.path.join("."),
            issue: e.message,
          })),
        });
      }
      return sendError(res, 500, {
        code: "INTERNAL",
        message: (error instanceof Error ? error.message : "Failed to move task"),
      });
    }
  };
  createTask = async (req: AuthRequest, res: Response) => {
    try {
      const { columnId } = req.params;
      const body = createTaskSchema.parse(req.body);
      const task = await this.taskService.createTask({
        data: body,
        column_id: columnId,
        user_id: req.user_id!,
      });
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Validation error",
          details: error.issues.map((e: any) => ({
            path: e.path.join("."),
            issue: e.message,
          })),
        });
      }
      return sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to create task",
      });
    }
  };

  updateTask = async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.params;
      const body = updateTaskSchema.parse(req.body);
      const task = await this.taskService.updateTask({
        data: {
          name: body.name,
          description: body.description,
          priority: body.priority,
          column_id: body.column_id,
        },
        task_id: taskId,
        user_id: req.user_id!,
      });
      res.json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Validation error",
          details: error.issues.map((e: any) => ({
            path: e.path.join("."),
            issue: e.message,
          })),
        });
      }
      return sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to update task",
      });
    }
  };

  deleteTask = async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.params;
      await this.taskService.deleteTask({
        task_id: taskId,
        user_id: req.user_id!,
      });
      res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      console.log("Error deleting task:", error); // Debug log
      return sendError(res, 500, {
        code: "INTERNAL",
        message: error instanceof Error ? error.message : "Failed to delete task",
      });
    }
  };
}
