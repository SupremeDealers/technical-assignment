import { Router } from "express";
import authRoutes from "./auth.routes";
import boardRoutes from "./board.routes";
import columnRoutes from "./column.routes";
import taskRoutes from "./task.routes";
import commentRoutes from "./comment.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/boards", boardRoutes);

router.use('/columns', columnRoutes);
router.use('/tasks', taskRoutes);
router.use('/comments', commentRoutes);

export default router;
