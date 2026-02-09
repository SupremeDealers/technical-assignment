import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { config } from "../config";
import { createError } from "./createError";

export interface JwtPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, config.jwt.secret as Secret, options);
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwt.secret as Secret) as JwtPayload;
  } catch {
    throw createError(401, "Invalid or expired token");
  }
};
