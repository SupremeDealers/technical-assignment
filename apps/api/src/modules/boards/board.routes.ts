import { Router } from "express";
import { getBoard, getColumns } from "./board.controller";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.get("/:id", requireAuth, getBoard);
router.get("/:id/columns", requireAuth, getColumns);

export default router;
