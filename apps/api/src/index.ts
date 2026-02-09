import express from "express";
import cors from "cors";
import { sendError } from "./errors";

// Import routes
import authRoutes from "./routes/auth";
import boardRoutes from "./routes/boards";
import columnRoutes from "./routes/columns";
import columnsTaskRoutes from "./routes/columnsWithTasks";
import taskRoutes from "./routes/tasks";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// Public routes
app.use("/auth", authRoutes);

// Protected routes
app.use("/boards", boardRoutes);
app.use("/columns", columnRoutes);
app.use("/columns", columnsTaskRoutes);
app.use("/tasks", taskRoutes);

/**
 * 404 handler
 */
app.use((req, res) => {
  sendError(res, 404, {
    code: "NOT_FOUND",
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

export default app;

