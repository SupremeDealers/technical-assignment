import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { sendError } from "../errors";
import { CreateUserDtoSchema, LoginUserDtoSchema } from "../validators";
import { z } from "zod";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response) => {
    try {
      // Validate input
      const body = CreateUserDtoSchema.parse(req.body);

      // Register user
      const result = await this.authService.register(body);

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Validation error",
          details: error.issues,
        });
      }

      if (error instanceof Error) {
        if (error.message.includes("already")) {
          return sendError(res, 409, {
            code: "CONFLICT",
            message: error.message,
          });
        }
      }

      return sendError(res, 500, {
        code: "INTERNAL",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred during registration",
      });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      // Validate input
      console.log("Login request body:", req.body); // Debug log
      const body = LoginUserDtoSchema.parse(req.body);

      console.log("Validated login data:", body); // Debug log

      // Login user
      const result = await this.authService.login(body);

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Validation error",
          details: error.issues,
        });
      }

      if (
        error instanceof Error &&
        error.message.includes("Invalid credentials")
      ) {
        return sendError(res, 401, {
          code: "UNAUTHORIZED",
          message: error.message || "Invalid credentials",
        });
      }

      return sendError(res, 500, {
        code: "INTERNAL",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred during login",
      });
    }
  };

  logout = (req: Request, res: Response) => {
    res.json({ message: "Logged out successfully" });
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      if (!token) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Token is required",
        });
      }

      const result = await this.authService.refreshToken({ token });
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        return sendError(res, 401, {
          code: "UNAUTHORIZED",
          message: error instanceof Error ? error.message : "An error occurred during token refresh",
        });
      }

      return sendError(res, 500, {
        code: "INTERNAL",
        message: error instanceof Error ? error.message : "An error occurred during token refresh",
      });
    }
  };

  me = async (req: Request, res: Response) => {
    res.json({ user: (req as any).user });
  };
}
