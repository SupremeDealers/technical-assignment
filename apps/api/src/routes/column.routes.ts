import { Router } from "express";
import { columnController } from "../controllers/column.controller";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth";
import {
  createColumnSchema,
  updateColumnSchema,
  columnIdParamSchema,
  boardIdParamSchema,
} from "../validators/column.schema";

const router = Router();

// All column routes require authentication
router.use(authenticate);

router.post(
  "/boards/:boardId/columns",
  validate(boardIdParamSchema, "params"),
  validate(createColumnSchema),
  columnController.createColumn,
);

router.put(
  "/:id",
  validate(columnIdParamSchema, "params"),
  validate(updateColumnSchema),
  columnController.updateColumn,
);

router.delete(
  "/:id",
  validate(columnIdParamSchema, "params"),
  columnController.deleteColumn,
);

export default router;
