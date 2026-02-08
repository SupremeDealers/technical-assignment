import { Router } from "express";
import authRoutes from "./auth";
import boardRoutes from "./board";
import columnRoutes from "./column";
import taskRoutes from "./task";
import commentRoutes from "./comment";

const router = Router();

router.use("/auth", authRoutes);
router.use("/boards", boardRoutes);
router.use("/columns", columnRoutes);
router.use("/tasks", taskRoutes);
router.use("/comments", commentRoutes);

export default router;
