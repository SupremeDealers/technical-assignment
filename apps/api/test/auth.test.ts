import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index";

describe("Auth", () => {
  it("POST /auth/register creates user and returns token", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "test@example.com", password: "password123", name: "Test User" })
      .expect(201);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user).toEqual({
      id: expect.any(Number),
      email: "test@example.com",
      name: "Test User",
    });
  });

  it("POST /auth/login returns token for valid credentials", async () => {
    await request(app)
      .post("/auth/register")
      .send({ email: "login@example.com", password: "secret456", name: "Login User" })
      .expect(201);
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "login@example.com", password: "secret456" })
      .expect(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("login@example.com");
  });

  it("POST /auth/login with invalid password returns 401", async () => {
    await request(app)
      .post("/auth/register")
      .send({ email: "unauth@example.com", password: "good1234", name: "User Data" })
      .expect(201);
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "unauth@example.com", password: "wrong" })
      .expect(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
});
