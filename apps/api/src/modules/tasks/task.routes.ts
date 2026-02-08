import { Router } from "express";
import {
  getTasksByColumn,
  createTask,
  updateTask,
  deleteTask,
} from "./task.controller";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.get("/column/:columnId", requireAuth, getTasksByColumn);
router.post("/column/:columnId", requireAuth, createTask);
router.patch("/:taskId", requireAuth, updateTask);
router.delete("/:taskId", requireAuth, deleteTask);

export default router;
