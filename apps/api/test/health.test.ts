import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index";

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/health").expect(200);
    expect(res.body.ok).toBe(true);
    expect(typeof res.body.ts).toBe("string");
  });
});

describe("POST /auth/register", () => {
  it("registers a new user", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        username: "testuser_" + Date.now(),
        email: `test_${Date.now()}@example.com`,
        password: "testpass123",
      })
      .expect(201);

    expect(res.body.user).toBeDefined();
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe("string");
  });

  it("rejects invalid email", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        username: "testuser",
        email: "invalid",
        password: "testpass123",
      })
      .expect(400);

    expect(res.body.error.code).toBe("BAD_REQUEST");
  });
});

describe("POST /auth/login", () => {
  it("logs in with valid credentials", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "alice@demo.com", password: "password123" })
      .expect(200);

    expect(res.body.user.username).toBe("alice");
    expect(res.body.token).toBeDefined();
  });

  it("rejects invalid credentials", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "alice@demo.com", password: "wrong" })
      .expect(401);

    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
});

describe("Protected routes", () => {
  it("returns 401 without auth header", async () => {
    const res = await request(app).get("/boards").expect(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns boards with valid token", async () => {
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "alice@demo.com", password: "password123" });

    const res = await request(app)
      .get("/boards")
      .set("Authorization", `Bearer ${loginRes.body.token}`)
      .expect(200);

    expect(Array.isArray(res.body.boards)).toBe(true);
  });
});
