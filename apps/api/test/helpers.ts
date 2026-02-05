import request from "supertest";
import type { Express } from "express";

/**
 * Register a user and return the auth token for use in authenticated requests.
 */
export async function getAuthToken(
  app: Express,
  overrides?: { email?: string; password?: string; name?: string }
): Promise<string> {
  const email = overrides?.email ?? `user-${Date.now()}@example.com`;
  const password = overrides?.password ?? "password123";
  const name = overrides?.name ?? "Test User";
  const res = await request(app)
    .post("/auth/register")
    .send({ email, password, name })
    .expect(201);
  return res.body.token as string;
}

/**
 * Ensure board 1 has at least one column and return its id. Use when tests need a column to create tasks.
 */
export async function getOrCreateFirstColumn(app: Express, token: string): Promise<number> {
  const colsRes = await request(app)
    .get("/boards/1/columns")
    .set("Authorization", `Bearer ${token}`);
  const columns = colsRes.body as Array<{ id: number; title: string }>;
  if (columns.length > 0) return columns[0].id;
  const createRes = await request(app)
    .post("/boards/1/columns")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "To Do" })
    .expect(201);
  return createRes.body.id as number;
}
