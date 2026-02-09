import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/index";
import { prisma } from "../src/db";

describe("Authentication", () => {
  const testEmail = "test@example.com";
  const testPassword = "password123";
  const testName = "Test User";

  afterAll(async () => {
    // Clean up test user
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
    await prisma.$disconnect();
  });

  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
        })
        .expect(201);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testEmail);
      expect(res.body.user.name).toBe(testName);
      expect(res.body.token).toBeDefined();
      expect(typeof res.body.token).toBe("string");
    });

    it("should return error if user already exists", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
        })
        .expect(409);

      expect(res.body.error.code).toBe("CONFLICT");
    });

    it("should return error if password is too short", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          email: "short@example.com",
          password: "123",
          name: "Test",
        })
        .expect(400);

      expect(res.body.error.code).toBe("BAD_REQUEST");
    });

    it("should return error if required fields are missing", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          email: "test2@example.com",
        })
        .expect(400);

      expect(res.body.error.code).toBe("BAD_REQUEST");
    });
  });

  describe("POST /auth/login", () => {
    it("should login with correct credentials", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testEmail);
      expect(res.body.token).toBeDefined();
    });

    it("should return error with wrong password", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: testEmail,
          password: "wrongpassword",
        })
        .expect(401);

      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("should return error with nonexistent user", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: testPassword,
        })
        .expect(401);

      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("should return error if required fields are missing", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: testEmail,
        })
        .expect(400);

      expect(res.body.error.code).toBe("BAD_REQUEST");
    });
  });

  describe("GET /auth/me", () => {
    let token: string;

    beforeAll(async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: testEmail,
          password: testPassword,
        });
      token = res.body.token;
    });

    it("should return current user with valid token", async () => {
      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testEmail);
    });

    it("should return error without token", async () => {
      const res = await request(app)
        .get("/auth/me")
        .expect(401);

      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("should return error with invalid token", async () => {
      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", "Bearer invalid_token")
        .expect(401);

      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });
  });
});
