import { Router } from "express";
import { loginSchema, signupSchema } from "../utilities/schema";
import { prisma } from "../utilities/db";
import bcrypt from "bcrypt"
import { ZodError } from "zod";
import jwt from 'jsonwebtoken';
import { JWT } from "../utilities/config";
import { sendError } from "../errors";

export const userRouter = Router();

// POST /auth/register - Register a new user
userRouter.post('/register', async (req, res) => {
    try {
        const { name, email, password } = signupSchema.parse(req.body);

        // Check if user already exists
        const existing = await prisma.user.findUnique({
            where: { email }
        })

        if (existing) {
            return sendError(res, 400, {
                code: "VALIDATION",
                message: "User already exists"
            })
        }

        // Hash password and create user
        const hashPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword
            }
        })

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        })
    } catch (e) {
        console.error("Failed to create account", e);
        if (e instanceof ZodError) {
            return sendError(res, 400, {
                code: "VALIDATION",
                message: "Invalid user data",
                details: e.message
            })
        }
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to create account"
        })
    }
})

// POST /auth/login - Login user and return JWT token
userRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        })

        // Verify user exists and password matches
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return sendError(res, 401, {
                code: "UNAUTHORIZED",
                message: "Invalid email or password"
            })
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, JWT, {
            expiresIn: "1h"
        })

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        })
    } catch (e) {
        console.error("Failed to login", e);
        if (e instanceof ZodError) {
            return sendError(res, 400, {
                code: "VALIDATION",
                message: "Invalid login data",
                details: e.message
            })
        }
        sendError(res, 500, {
            code: "INTERNAL",
            message: "Failed to login"
        })
    }
})