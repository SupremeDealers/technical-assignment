import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../db/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function registerUser(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: { email, passwordHash },
  });
}


export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  const token = signToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  };
};

export function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}
