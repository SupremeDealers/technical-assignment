import jwt, { JwtPayload as BaseJwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

// * Custom Payload

export interface JwtPayload extends BaseJwtPayload {
  userId: string;
  email: string;
}

//* Common JWT Options

const COMMON_OPTIONS: SignOptions = {
  algorithm: "HS256",
  issuer: "team-boards-api",
  audience: "team-boards-users",
};

// * Sign Access Token

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    ...COMMON_OPTIONS,
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

// * Verify Token Safely

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "team-boards-api",
      audience: "team-boards-users",
    });

    if (typeof decoded === "string") return null;

    return decoded as JwtPayload;
  } catch {
    return null;
  }
}

// * Optional: Decode without verification (debug only)

export function decodeToken(token: string) {
  return jwt.decode(token);
}
