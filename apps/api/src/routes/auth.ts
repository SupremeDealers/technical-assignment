import express from "express";
import bcrypt from "bcryptjs";
import { registerSchema, loginSchema, type RegisterData, type LoginData } from "../auth/validators";
import { generateToken } from "../auth/jwt";
import { sendError } from "../errors";

const router = express.Router();

// Temporary in-memory storage (will be replaced with database)
interface User {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

let users: User[] = [
  {
    id: 1,
    email: "test@example.com",
    passwordHash: bcrypt.hashSync("test123", 10),
    name: "Test User",
    createdAt: new Date().toISOString(),
  },
];

let nextUserId = 2;

router.post("/register", async (req, res) => {
  try {
    console.log("Register req.body:", req.body);
    const data = registerSchema.parse(req.body);

    // Check if email already exists
    const existingUser = users.find((u) => u.email === data.email);
    if (existingUser) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Email already exists",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const user: User = {
      id: nextUserId++,
      email: data.email,
      passwordHash,
      name: data.name,
      createdAt: new Date().toISOString(),
    };

    users.push(user);

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error: any) {
    if (error.issues) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid input",
        details: error.issues,
      });
    }
    sendError(res, 500, {
      code: "INTERNAL",
      message: "Internal server error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = users.find((u) => u.email === data.email);
    if (!user) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error: any) {
    if (error.issues) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid input",
        details: error.issues,
      });
    }
    sendError(res, 500, {
      code: "INTERNAL",
      message: "Internal server error",
    });
  }
});

export default router;
