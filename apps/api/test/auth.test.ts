import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index";

const demoUser = {
  email: "demo@example.com",
  username: "demo_user",
  password: "password123",
};

const registerUrl = "/auth/register";
const loginUrl = "/auth/login";
const logoutUrl = "/auth/logout";

describe("Auth Endpoints", () => {
  let token: string;

  it("registers a new user", async () => {
    const unique = Date.now();
    const res = await request(app)
      .post(registerUrl)
      .send({
        email: `testuser${unique}@example.com`,
        username: `testuser${unique}`,
        password: "testpass123",
      })
      .expect(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body).toHaveProperty("access_token");
  });

  it("fails to register duplicate user", async () => {
    const unique = Date.now();
    // Register once
    await request(app)
      .post(registerUrl)
      .send({
        email: `dupe${unique}@example.com`,
        username: `dupe${unique}`,
        password: "testpass123",
      })
      .expect(201);
    // Register again with same email/username
    const res = await request(app)
      .post(registerUrl)
      .send({
        email: `dupe${unique}@example.com`,
        username: `dupe${unique}`,
        password: "testpass123",
      })
      .expect(409);
    expect(res.body).toMatchObject({
      ok: false,
      code: "CONFLICT",
    });
  });

  it("logs in demo user", async () => {
    const res = await request(app)
      .post(loginUrl)
      .send({
        email: demoUser.email,
        password: demoUser.password,
      })
      .expect(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body).toHaveProperty("access_token");
    token = res.body.access_token;
  });

  it("fails login with wrong password", async () => {
    const res = await request(app)
      .post(loginUrl)
      .send({
        email: demoUser.email,
        password: "wrongpassword",
      })
      .expect(401);
    expect(res.body).toMatchObject({
      ok: false,
      code: "UNAUTHORIZED",
    });
  });

  it("logs out user", async () => {
    const res = await request(app)
      .post(logoutUrl)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty("message");
  });

  it("fails refresh token with missing token", async () => {
    const res = await request(app).post("/auth/refresh").send({}).expect(400);
    expect(res.body).toMatchObject({
      ok: false,
      code: "BAD_REQUEST",
    });
  });
});
