import express from "express";
import cors from "cors";
import { sendError } from "./errors";
import authRoutes from "./routes/auth";
import boardRoutes from "./routes/boards";
import taskRoutes from "./routes/task";
import commentsRoutes from "./routes/comments";
import columnsRoutes from "./routes/columns";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", boardRoutes);
app.use("/api", taskRoutes);
app.use("/api", commentsRoutes);
app.use("/api", columnsRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

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

export default app;
