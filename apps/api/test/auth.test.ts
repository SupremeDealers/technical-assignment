import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/index";
import { db, initDb } from "../src/db/db";

describe("Auth API", () => {
  beforeAll(() => {
    initDb();
    // Clear test user if exists
    db.prepare("DELETE FROM users WHERE email = ?").run("test@example.com");
  });

  describe("POST /auth/register", () => {
    it("creates a new user", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        })
        .expect(201);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe("test@example.com");
      expect(res.body.user.name).toBe("Test User");
      expect(res.body.token).toBeDefined();
      expect(res.body.user.password).toBeUndefined();
    });

    it("rejects duplicate email", async () => {
      await request(app)
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        })
        .expect(409);
    });

    it("validates required fields", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          email: "invalid",
          password: "short",
        })
        .expect(400);

      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe("BAD_REQUEST");
    });
  });

  describe("POST /auth/login", () => {
    it("logs in existing user", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        })
        .expect(200);

      expect(res.body.user).toBeDefined();
      expect(res.body.token).toBeDefined();
    });

    it("rejects invalid credentials", async () => {
      await request(app)
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        })
        .expect(401);
    });
  });
});
