import request from "supertest";
import app from "../src/app";
import sequelize from "../src/config/database";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";

describe("Auth API", () => {

  // 2️⃣ Clean data AFTER EVERY TEST
  afterEach(async () => {
    await sequelize.truncate({ cascade: true });
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it("should fail with duplicate email", async () => {
      await request(app).post("/api/auth/register").send({
        name: "User One",
        email: "duplicate@example.com",
        password: "password123",
      });

      const response = await request(app).post("/api/auth/register").send({
        name: "User Two",
        email: "duplicate@example.com",
        password: "password456",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully", async () => {
      await request(app).post("/api/auth/register").send({
        name: "Login User",
        email: "login@example.com",
        password: "password123",
      });

      const response = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
    });

    it("should fail with wrong password", async () => {
      await request(app).post("/api/auth/register").send({
        name: "Login User",
        email: "login@example.com",
        password: "password123",
      });

      const response = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
    });
  });
});
