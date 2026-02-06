import { NextFunction, Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { AuthRequest, requireAuth } from "../middleware/requireAuth";
import { signToken } from "../utils/jwt";
import { prisma } from "../db/prisma";
import { sendError } from "../errors";

const router = Router();

router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = registerSchema.parse(req.body);

      const exists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (exists) {
        return res.status(409).json({
          code: "EMAIL_EXISTS",
          message: `Email already registered: ${req.method} ${req.path}`,
        });
      }

      const hash = await bcrypt.hash(data.password, 10);

      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hash,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      const token = signToken({
        id: user.id,
        email: user.email,
      });

      res.status(201).json({
        data: {
          token,
          user,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return sendError(res, 401, {
        code: "FORBIDDEN",
        message: `Invalid email or password: ${req.method} ${req.path}`,
      });
    }

    const isValidPass = await bcrypt.compare(data.password, user.password);

    if (!isValidPass) {
      return sendError(res, 401, {
        code: "FORBIDDEN",
        message: `Invalid email or password: ${req.method} ${req.path}`,
      });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    res.json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, name: true },
  });

  res.json({ data: user });
});

export default router;
