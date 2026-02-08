import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { sendError, zodError } from "../errors";
import { CreateUserDtoSchema, LoginUserDtoSchema } from "../validators";
import { z } from "zod";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response) => {
    try {
      const body = CreateUserDtoSchema.parse(req.body);
      const result = await this.authService.register(body);

      res.status(201).json(result);
    } catch (error) {
      return zodError(res, error as z.ZodError);
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const body = LoginUserDtoSchema.parse(req.body);
      const result = await this.authService.login(body);

      res.json(result);
    } catch (error) {
      return zodError(res, error as z.ZodError);
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      // If you want to actually handle token invalidation, do it here
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      return zodError(res, error as z.ZodError);
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      if (!token) {
        return sendError(res, 400, {
          message: "Token is required",
        });
      }

      const result = await this.authService.refreshToken({ token });
      res.json(result);
    } catch (error) {
      return zodError(res, error as z.ZodError);
    }
  };
}
