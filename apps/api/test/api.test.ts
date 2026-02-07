import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index";

describe("Auth API", () => {
  const testEmail = `test${Date.now()}@example.com`;

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        email: testEmail,
        password: "password123",
        name: "Test User",
      })
      .expect(201);

    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.token).toBeDefined();
  });

  it("should login existing user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "demo@example.com",
        password: "password123",
      })
      .expect(200);

    expect(res.body.user).toBeDefined();
    expect(res.body.token).toBeDefined();
  });

  it("should reject invalid credentials", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "demo@example.com",
        password: "wrongpassword",
      })
      .expect(401);

    expect(res.body.error).toBeDefined();
  });
});

describe("Board API", () => {
  let token: string;

  it("should access board with valid token", async () => {
    const loginRes = await request(app)
      .post("/auth/login")
      .send({
        email: "demo@example.com",
        password: "password123",
      });

    token = loginRes.body.token;

    const res = await request(app)
      .get("/boards/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.id).toBe(1);
    expect(res.body.name).toBeDefined();
  });

  it("should reject request without token", async () => {
    await request(app).get("/boards/1").expect(401);
  });
});
