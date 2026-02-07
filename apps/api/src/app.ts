import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "./modules/auth/auth.routes";
import { errorHandler } from "./middleware/error.middleware";
import { env } from "./config/env";

export function createApp() {
  const app = express();
  //!Basic Security Headers
  app.disable("x-powered-by");
  app.use(helmet());

//! CORS Configuration (Allow all in dev, restrict in prod)
  app.use(
    cors({
      origin: env.NODE_ENV === "production" ? ["http://localhost:5173/"] : "*",
      credentials: true,
    }),
  );

//! Body Parser with size limit
  app.use(express.json({ limit: "1mb" }));

//
  app.set("trust proxy", 1);


  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });


  app.use("/api/auth", authRouter);

  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
      },
    });
  });

  app.use(errorHandler);

  return app;
}
