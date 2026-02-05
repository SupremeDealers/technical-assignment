import express from "express";
import cors from "cors";
import { sendError } from "./errors";
import authRoutes from "./routes/auth";
import boardRoutes from "./routes/boards";
import columnRoutes from "./routes/columns";
import taskRoutes from "./routes/tasks";
import taskByIdRoutes from "./routes/taskById";
import commentRoutes from "./routes/comments";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/boards", boardRoutes);
app.use("/columns", columnRoutes);
app.use("/columns", taskRoutes); // GET/POST /columns/:columnId/tasks
app.use("/tasks", taskByIdRoutes); // PATCH/DELETE /tasks/:taskId
app.use("/tasks", commentRoutes); // GET/POST /tasks/:taskId/comments

app.use((req, res) => {
  sendError(res, 404, {
    code: "NOT_FOUND",
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

export default app;
