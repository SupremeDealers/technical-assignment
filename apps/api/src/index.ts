import express from "express";
import cors from "cors";
// import { sendError } from "./errors";
import { errorHandler } from "./middleware/errorHandler";
import { AppError } from "./utils/AppError";
import authRoutes from "./routes/authRoutes";
import adminRoutes from './routes/adminRoutes'
import "dotenv/config"
import cookieParser from 'cookie-parser';



const app = express();
const port = Number(process.env.PORT);
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Core base routes
app.get("/", (_req, res) => {
  res.status(200).json({ 
    Message: `Welcome to the API running on port ${port}`, 
    Routes: {
      'Health Check':'/health',
      'Authentication Routes':'/auth',
      'Board related routes': '/boards',
      'Column related routes': '/columns',
      'Tasks related routes': '/tasks',
      'User comment related routes': '/comments',
    },
  });
})

app.get("/health", (_req, res) => {
   res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/auth", authRoutes);
app.use('/admin', adminRoutes);
/**
 * Example: how we want errors shaped.
 * Candidates should re-use this for their implementation.
 * --- 404 Handler (Missing Route) ---
 * Instead of sending JSON directly, we pass an error to the global handler
 */
app.use((req, res, next) => {
  next(new AppError(404, 'NOT_FOUND', `Route not found: ${req.method} ${req.path}`));
});
// --- Global Error Handler (Must be last) ---
app.use(errorHandler);

app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});

export default app;
