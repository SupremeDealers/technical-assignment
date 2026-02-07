import bcrypt from "bcrypt";
import { env } from "../config/env";

const DEFAULT_SALT_ROUNDS = 12;

//! Determine salt rounds safely

function getSaltRounds(): number {
  const rounds = Number(process.env.BCRYPT_ROUNDS);
  if (!Number.isInteger(rounds) || rounds < 10 || rounds > 15) {
    return DEFAULT_SALT_ROUNDS;
  }
  return rounds;
}

const SALT_ROUNDS = getSaltRounds();

// * Hash Password

export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch {
    throw new Error("Password hashing failed");
  }
}

// * Compare Password

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  if (!password || !hashedPassword) return false;

  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch {
    return false;
  }
}
