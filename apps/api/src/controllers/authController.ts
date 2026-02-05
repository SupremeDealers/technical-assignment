import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { loginSchema, registerSchema } from '../request_validations/auth';
import 'dotenv/config';

//configurations
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10');


export const register = catchAsync(async (req: Request, res: Response) => {
  /*
  * Operations -> 
  * 1. Check validation error from Joi Schema
  * 2. Check if email already exists in DB
  * 3. Hash Password
  * 4. Create User 
  * 5. Generate JWT Token
  * 6. Send Response with user data and Token
  */
  const { error, value } = registerSchema.validate(req.body);
  if (error) throw error;

  const existingUser = await db.select().from(users).where(eq(users.email, value.email)).get();
  if (existingUser) {
    throw new AppError(409, 'CONFLICT', 'Email already in use');
  }

  const hashedPassword = await bcrypt.hash(value.password, SALT_ROUNDS);

  const [newUser] = await db.insert(users).values({
    email: value.email,
    passwordHash: hashedPassword,
    name: value.name || 'Anonymous',
  }).returning({
    id: users.id,
    email: users.email,
    name: users.name,
    createdAt: users.createdAt,
  });


  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET as string, { expiresIn: '1d' });

  res.status(201).json({ user: newUser, token });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  /*
  * Operations ->
  * 1. Check the login input joi validation
  * 2. Find user by email, if not found throw error
  * 3. Verify Password
  * 4. Generate JWT Token
  * 5. Send Response with user data and Token
  */

  const { error, value } = loginSchema.validate(req.body);
  if (error) throw error;

  const user = await db.select().from(users).where(eq(users.email, value.email)).get();
  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(value.password, user.passwordHash);
  if (!isMatch) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET as string, { expiresIn: '1d' });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    token,
  });
});