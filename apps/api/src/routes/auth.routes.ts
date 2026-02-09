import { RequestHandler, Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth";
import { registerSchema, loginSchema } from "../validators/auth.schema";
import rateLimit from "express-rate-limit";
import { config } from "../config";

const router = Router();

// Rate limiter for auth routes
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5,
//   message: "Too many authentication attempts, please try again later",
//   standardHeaders: true,
//   legacyHeaders: false,
// });
const noopLimiter: RequestHandler = (req, res, next) => next();

const authLimiter: RequestHandler =
  config.nodeEnv === "test"
    ? noopLimiter
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 25,
        message: "Too many authentication attempts",
      });

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.register,
);

router.post("/login", authLimiter, validate(loginSchema), authController.login);

router.get("/me", authenticate, authController.getMe);

export default router;
