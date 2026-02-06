import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret";

export const signToken = (payload: { userId: string }) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
};
