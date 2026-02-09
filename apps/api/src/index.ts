import express from "express";
import cors from "cors";
import { sendError } from "./errors";
import { getDb, closeDb } from "./db/index";
import authRoutes from "./auth/routes";
import boardRoutes from "./boards/routes";
import columnRoutes from "./columns/routes";
import tasksRoutes from "./tasks/routes";
import taskRoutes from "./tasks/task-routes";
import commentsRoutes from "./comments/routes";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Initialize database on startup
getDb();

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// Mount routes
app.use("/auth", authRoutes);
app.use("/boards", boardRoutes);
app.use("/columns", columnRoutes);
app.use("/columns", tasksRoutes);
app.use("/tasks", taskRoutes);
app.use("/tasks", commentsRoutes);

/**
 * Example: how we want errors shaped.
 * Candidates should re-use this for their implementation.
 */
app.use((req, res) => {
  sendError(res, 404, {
    code: "NOT_FOUND",
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// Only start server if this module is run directly (not imported for testing)
const isMainModule = process.env.NODE_ENV !== 'test';
if (isMainModule) {
  const port = Number(process.env.PORT ?? 4000);
  const server = app.listen(port, () => {
    console.log(`[api] listening on http://localhost:${port}`);
  });

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n[api] shutting down gracefully...");
    server.close(() => {
      closeDb();
      process.exit(0);
    });
  });

  process.on("SIGTERM", () => {
    console.log("\n[api] shutting down gracefully...");
    server.close(() => {
      closeDb();
      process.exit(0);
    });
  });
}

export default app;
