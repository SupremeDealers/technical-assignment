import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../src/index";
import { getDb, closeDb } from "../src/db/index";

describe("Authentication", () => {
  afterAll(() => {
    closeDb();
  });

  beforeEach(() => {
    // Clear users table before each test
    const db = getDb();
    db.prepare("DELETE FROM users").run();
  });

  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        })
        .expect(201);

      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.email).toBe("test@example.com");
      expect(response.body.user.name).toBe("Test User");
      expect(response.body.user).not.toHaveProperty("password_hash");
    });

    it("should return error for duplicate email", async () => {
      // First registration
      await request(app).post("/auth/register").send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      // Try to register with same email
      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "password456",
          name: "Another User",
        })
        .expect(400);

      expect(response.body.error.code).toBe("BAD_REQUEST");
      expect(response.body.error.message).toContain("already exists");
    });

    it("should return validation error for invalid email", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "invalid-email",
          password: "password123",
          name: "Test User",
        })
        .expect(400);

      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return validation error for short password", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "123",
          name: "Test User",
        })
        .expect(400);

      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      // Register a user for login tests
      await request(app).post("/auth/register").send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
    });

    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.email).toBe("test@example.com");
    });

    it("should return error for invalid email", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "wrong@example.com",
          password: "password123",
        })
        .expect(401);

      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });

    it("should return error for invalid password", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });
  });
});
