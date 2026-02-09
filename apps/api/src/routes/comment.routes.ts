import { Router } from "express";
import { commentController } from "../controllers/comment.controller";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth";
import {
  createCommentSchema,
  taskIdParamSchema,
} from "../validators/comment.schema";
import { paginationSchema } from "../validators/pagination.schema";

const router = Router();

// All comment routes require authentication
router.use(authenticate);

router.post(
  "/tasks/:taskId/comments",
  validate(taskIdParamSchema, "params"),
  validate(createCommentSchema),
  commentController.createComment,
);

router.get(
  "/tasks/:taskId/comments",
  validate(taskIdParamSchema, "params"),
  validate(paginationSchema, "query"),
  commentController.getComments,
);

export default router;
