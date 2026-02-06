import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  getTasksHandler,
  postTaskHandler,
  patchTaskHandler,
  deleteTaskHandler,
} from "./tasks.controller";

export const tasksRouter = Router({ mergeParams: true });

tasksRouter.get("/", requireAuth, getTasksHandler);
tasksRouter.post("/", requireAuth, postTaskHandler);
tasksRouter.patch("/:taskId", requireAuth, patchTaskHandler);
tasksRouter.delete("/:taskId", requireAuth, deleteTaskHandler);
