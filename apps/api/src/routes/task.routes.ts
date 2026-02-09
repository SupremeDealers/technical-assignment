import { Router } from "express";
import { taskController } from "../controllers/task.controller";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth";
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  taskIdParamSchema,
  columnIdParamSchema,
  boardIdParamSchema,
} from "../validators/task.schema";
import { paginationSchema } from "../validators/pagination.schema";

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.post(
  "/columns/:columnId/tasks",
  validate(columnIdParamSchema, "params"),
  validate(createTaskSchema),
  taskController.createTask,
);

router.get(
  "/boards/:boardId/tasks",
  validate(boardIdParamSchema, "params"),
  validate(paginationSchema, "query"),
  taskController.getTasks,
);

router.put(
  "/:id",
  validate(taskIdParamSchema, "params"),
  validate(updateTaskSchema),
  taskController.updateTask,
);

router.delete(
  "/:id",
  validate(taskIdParamSchema, "params"),
  taskController.deleteTask,
);

router.patch(
  "/:id/move",
  validate(taskIdParamSchema, "params"),
  validate(moveTaskSchema),
  taskController.moveTask,
);

export default router;
