import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";
import { sendSuccess } from "../utils/response";
import { RegisterInput, LoginInput } from "../validators/auth.schema";

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: RegisterInput = req.body;

      const result = await authService.register(data);

      sendSuccess(res, result, "User registered successfully", 201);
    } catch (error) {
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: LoginInput = req.body;

      const result = await authService.login(data);

      sendSuccess(res, result, "Login successful");
    } catch (error) {
      next(error);
    }
  },

  getMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const result = await authService.getMe(userId);

      sendSuccess(res, result, "User retrieved successfully");
    } catch (error) {
      next(error);
    }
  },
};
