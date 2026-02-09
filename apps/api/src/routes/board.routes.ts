import { Router } from "express";
import { boardController } from "../controllers/board.controller";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth";
import {
  createBoardSchema,
  updateBoardSchema,
  boardIdParamSchema,
} from "../validators/board.schema";

const router = Router();

// All board routes require authentication
router.use(authenticate);

router.post("/", validate(createBoardSchema), boardController.createBoard);

router.get("/", boardController.getBoards);

router.get("/:id", validate(boardIdParamSchema, "params"), boardController.getBoardById);

router.put(
  "/:id",
  validate(boardIdParamSchema, "params"),
  validate(updateBoardSchema),
  boardController.updateBoard
);

router.delete(
  "/:id",
  validate(boardIdParamSchema, "params"),
  boardController.deleteBoard
);

export default router;
