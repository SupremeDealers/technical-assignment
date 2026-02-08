import "./env";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { sendError, ServiceError } from "./utils/errors";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import commentRoutes from "./routes/comment.routes";
import { ZodError } from "zod";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/", taskRoutes);
app.use("/", commentRoutes);

app.use((req, res) => {
  sendError(res, 404, {
    code: "NOT_FOUND",
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof ServiceError) {
    return sendError(res, err.status, {
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  if (err instanceof ZodError) {
    return sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Validation failed",
      details: err.issues,
    });
  }

  return sendError(res, 500, {
    code: "INTERNAL",
    message: "Internal Server Error",
  });
});

const port = Number(process.env.PORT ?? 4000);

const isTestRun =
  process.env.NODE_ENV === "test" ||
  process.env.npm_lifecycle_event === "test" ||
  typeof process.env.VITEST_WORKER_ID !== "undefined";

if (!isTestRun) {
  app.listen(port, () => {
    console.log(`[api] listening on http://localhost:${port}`);
  });
}

export default app;
