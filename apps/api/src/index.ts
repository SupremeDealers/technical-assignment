import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { sendError } from "./errors";
import { swaggerSpec } from "./config/swagger";

// Import routes
import authRoutes from "./routes/auth.route";
import boardRoutes from "./routes/boards.route";
import columnRoutes from "./routes/columns.route";
import taskRoutes from "./routes/tasks.route";
import commentRoutes from "./routes/comments.route";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// Mount routes
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

// Global error handler - must be after all routes
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    // Handle JSON parsing errors from body-parser
    if (err instanceof SyntaxError && "body" in err) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid JSON format in request body",
        details: err.message,
      });
    }

    // Handle other errors
    console.error("Unhandled error:", err);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  },
);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});

export default app;
