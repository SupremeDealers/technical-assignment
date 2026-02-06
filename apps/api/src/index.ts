import express from "express";
import cors from "cors";
import { sendError } from "./errors";
import authRoutes from "./routes/auth";
import boardRoutes from "./routes/boards";
import columnRoutes from "./routes/columns";
import taskRoutes from "./routes/tasks";
import commentRoutes from "./routes/comments";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// API routes
app.use("/auth", authRoutes);
app.use("/boards", boardRoutes);
app.use("/columns", columnRoutes);
app.use("/tasks", taskRoutes);
app.use("/comments", commentRoutes);

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

// Only listen on port if this file is run directly (not imported as a module)
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => {
    console.log(`[api] listening on http://localhost:${port}`);
  });
}

export default app;
