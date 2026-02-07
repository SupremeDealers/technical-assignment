import type { CookieOptions } from "express";

export const AUTH_COOKIE = "tb_token";

export function authCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  };
}
