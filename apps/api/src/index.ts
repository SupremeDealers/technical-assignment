import express from "express";
import cors from "cors";
import { sendError } from "./errors.js";

// Import DB to ensure schema is created
import "./db.js";

// Import routes
import authRoutes from "./routes/auth.js";
import boardRoutes from "./routes/boards.js";
import columnRoutes from "./routes/columns.js";
import taskRoutes from "./routes/tasks.js";
import commentRoutes from "./routes/comments.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ── Health ───────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/boards", boardRoutes);
app.use("/columns", columnRoutes);
app.use("/", taskRoutes);           // handles /columns/:id/tasks & /tasks/:id
app.use("/tasks", commentRoutes);   // handles /tasks/:id/comments

// ── Error handler ────────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[api] Unhandled error:", err);
  sendError(res, 500, {
    code: "INTERNAL",
    message: "Internal server error",
  });
});

// ── 404 catch-all ────────────────────────────────────────────────────
app.use((req, res) => {
  sendError(res, 404, {
    code: "NOT_FOUND",
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

const port = Number(process.env.PORT ?? 4000);

// Only start the server if not being imported for tests
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`[api] listening on http://localhost:${port}`);
  });
}

export default app;
