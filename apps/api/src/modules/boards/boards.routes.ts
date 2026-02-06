import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { getBoards, getBoardById, postBoard } from "./boards.controller";
const router = Router();

router.get("/", requireAuth, getBoards);
router.post("/", requireAuth, postBoard);
router.get("/:boardId", requireAuth, getBoardById);

export default router;
