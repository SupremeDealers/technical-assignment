import bcrypt from "bcrypt";
import * as userRepository from "../repositories/user.repository";
import { signToken } from "../auth/jwt";
import type { User } from "../types/entities";

const SALT_ROUNDS = 10;

export type RegisterInput = { email: string; password: string; name: string };
export type LoginInput = { email: string; password: string };
export type AuthResult = { token: string; user: User };

export function register(input: RegisterInput): AuthResult {
  console.log("register", input);
  const existing = userRepository.findByEmail(input.email);
  console.log("existing", existing);
  if (existing) {
    throw { code: "CONFLICT" as const, message: "Email already registered" };
  }
  const passwordHash = bcrypt.hashSync(input.password, SALT_ROUNDS);
  console.log("passwordHash", passwordHash);
  const user = userRepository.create({
    email: input.email,
    passwordHash,
    name: input.name,
  });
  const token = signToken({ userId: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email, name: user.name } };
}

export function login(input: LoginInput): AuthResult {
  const row = userRepository.findByEmail(input.email);
  if (!row || !row.passwordHash || !bcrypt.compareSync(input.password, row.passwordHash)) {
    throw { code: "UNAUTHORIZED" as const, message: "Invalid email or password" };
  }
  const token = signToken({ userId: row.id, email: row.email });
  return {
    token,
    user: { id: row.id, email: row.email, name: row.name },
  };
}
