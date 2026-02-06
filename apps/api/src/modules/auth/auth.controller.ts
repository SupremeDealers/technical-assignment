import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schema";
import { registerUser, loginUser, signToken } from "./auth.service";

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);

  const user = await registerUser(data.email, data.password);
  const token = signToken(user.id);

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
  });

  res.status(201).json({ id: user.id, email: user.email, token });
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const { token, user } = await loginUser(data.email, data.password);

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
  });

  res.json({ id: user.id, email: user.email, token });
}
