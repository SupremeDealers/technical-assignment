import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { parseOrError } from "../validate";
import { sendError } from "../errors";
import { hashPassword, verifyPassword } from "../auth/password";
import { signToken } from "../auth/jwt";
import { AUTH_COOKIE, authCookieOptions } from "../auth/cookies";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/register", async (req, res) => {
  const body = parseOrError(res, registerSchema, req.body);
  if (!body) return;

  const existing = await prisma.user.findUnique({
    where: { email: body.email },
  });
  if (existing) {
    return sendError(res, 409, {
      code: "CONFLICT",
      message: "Email already registered",
    });
  }

  const passwordHash = await hashPassword(body.password);
  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      passwordHash,
      boards: {
        create: {
          title: `${body.name}'s Board`,
          columns: {
            create: [
              { title: "Todo", order: 1 },
              { title: "Doing", order: 2 },
              { title: "Done", order: 3 },
            ],
          },
        },
      },
    },
    include: { boards: true },
  });

  const token = signToken({ userId: user.id });
  res.cookie(AUTH_COOKIE, token, authCookieOptions());
  return res.json({
    user: { id: user.id, name: user.name, email: user.email },
    boardId: user.boards[0]?.id,
  });
});

router.post("/login", async (req, res) => {
  const body = parseOrError(res, loginSchema, req.body);
  if (!body) return;

  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });
  if (!user) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid credentials",
    });
  }

  const ok = await verifyPassword(body.password, user.passwordHash);
  if (!ok) {
    return sendError(res, 401, {
      code: "UNAUTHORIZED",
      message: "Invalid credentials",
    });
  }

  const board = await prisma.board.findFirst({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const token = signToken({ userId: user.id });
  res.cookie(AUTH_COOKIE, token, authCookieOptions());
  return res.json({
    user: { id: user.id, name: user.name, email: user.email },
    boardId: board?.id,
  });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(AUTH_COOKIE, { path: "/" });
  return res.json({ ok: true });
});

export default router;
