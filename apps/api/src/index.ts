import express from "express";
import cors from "cors";
import { sendError } from "./errors";
import { registerAuthRoutes } from "./routes/auth.routes";
import { registerBoardRoutes } from "./routes/board.routes";
import { registerColumnRoutes } from "./routes/column.routes";
import { registerTaskRoutes } from "./routes/task.routes";
import { registerCommentRoutes } from "./routes/comment.routes";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// Register all routes
registerAuthRoutes(app);
registerBoardRoutes(app);
registerColumnRoutes(app);
registerTaskRoutes(app);
registerCommentRoutes(app);

/**
 * 404 fallback - must be last
 */
app.use((req, res) => {
  sendError(res, 404, {
    code: "NOT_FOUND",
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

export default app;

// Only start server if this is the main module (not imported by tests)
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => {
    console.log(`[api] listening on http://localhost:${port}`);
  });
}
