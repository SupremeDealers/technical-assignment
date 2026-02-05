import { Router } from "express";
import { authMiddleware } from "../auth/middleware";
import * as boardsController from "../controllers/boards.controller";

const router = Router();
router.use(authMiddleware);

router.get("/:boardId", boardsController.getBoard);
router.get("/:boardId/columns", boardsController.getColumns);
router.post("/:boardId/columns", boardsController.createColumn);

export default router;
