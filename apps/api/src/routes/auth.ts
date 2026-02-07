import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../db";
import { users } from "../db/schema";
import { registerSchema, loginSchema } from "../validation/schemas";
import { generateToken } from "../middleware/auth";
import { sendError } from "../errors";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (existingUser) {
      return sendError(res, 409, {
        code: "CONFLICT",
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const [user] = await db
      .insert(users)
      .values({
        ...validatedData,
        password: hashedPassword,
      })
      .returning({ id: users.id, email: users.email, name: users.name });

    const token = generateToken(user.id);

    res.status(201).json({ user, token });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: error.errors,
      });
    }
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Internal server error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (!user) {
      return sendError(res, 401, {
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }

    const validPassword = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!validPassword) {
      return sendError(res, 401, {
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user.id);

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: error.errors,
      });
    }
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "Internal server error",
    });
  }
});

export default router;
