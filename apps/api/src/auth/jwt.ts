import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
const expiresIn = process.env.JWT_EXPIRES ?? "7d";

export type TokenPayload = { userId: number; email: string };

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, secret as jwt.Secret, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}
