import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as boardController from "../controllers/board";
import * as taskController from "../controllers/task";

const router = Router();

router.use(authMiddleware);

router.post("/", boardController.createBoard);
router.get("/", boardController.getBoards);
router.get("/:boardId", boardController.getBoard);
router.delete("/:boardId", boardController.deleteBoard);
router.get("/:boardId/columns", boardController.getBoardColumns);
router.post("/:boardId/columns", boardController.createBoardColumn);
router.get("/:boardId/tasks", taskController.getBoardTasks);

export default router;
