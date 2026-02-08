import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/index";
import { db } from "../src/db";

describe("Auth Endpoints", () => {
  const email = `test-${Date.now()}@example.com`;
  const password = "password123";

  it("POST /auth/register should create a new user", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email, password });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email);
    expect(res.body.token).toBeDefined();
  });

  it("POST /auth/login should return a token for valid credentials", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("POST /auth/login should fail with invalid credentials", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email, password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  afterAll(async () => {
    await db.$disconnect();
  });
});
