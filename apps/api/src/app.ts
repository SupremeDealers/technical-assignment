import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { sendSuccess, sendError } from "./utils/response";

const app: Application = express();

// Trust proxy (needed for Render / Railway / Nginx)
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());

// CORS middleware
app.use(
  cors({
    origin: "*", // later replace with frontend URL
    credentials: true,
  })
);

// Logging middleware
app.use(morgan("dev"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  return sendSuccess(res, null, "Server is running");
});

// API routes
app.use("/api", routes);

// 404 handler
app.use((req: Request, res: Response) => {
  return sendError(res, "Route not found", 404);
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
