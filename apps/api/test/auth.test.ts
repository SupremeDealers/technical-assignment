import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";
import { ensureSchema, resetDb } from "./db";

beforeAll(async () => {
  await ensureSchema();
});

beforeEach(async () => {
  await resetDb();
});

describe("auth flow", () => {
  it("registers and returns a board id", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Ana",
      email: "ana@example.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("ana@example.com");
    expect(typeof res.body.boardId).toBe("string");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("logs in with valid credentials", async () => {
    await request(app).post("/auth/register").send({
      name: "Sam",
      email: "sam@example.com",
      password: "password123",
    });
    const res = await request(app).post("/auth/login").send({
      email: "sam@example.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe("Sam");
    expect(res.headers["set-cookie"]).toBeDefined();
  });
});
