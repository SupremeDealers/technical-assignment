import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/index";

// Helper to prevent email collisions
const randomEmail = () => `test-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;

describe("Auth API (New Users)", () => {
  
  it("should register a new user successfully", async () => {
    const email = randomEmail();
    
    const res = await request(app).post("/auth/register").send({
      email,
      password: "password123",
      name: "Test User",
      role: "user"
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.passwordHash).toBeUndefined(); // Security check
  });

  it("should fail to register with duplicate email", async () => {
    const email = randomEmail();

    // First request
    await request(app).post("/auth/register").send({
      email,
      password: "password123"
    });

    // Second request (Duplicate)
    const res = await request(app).post("/auth/register").send({
      email,
      password: "password123"
    });

    expect(res.status).toBe(409); // Conflict
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("should fail login with wrong password", async () => {
    const email = randomEmail();
    
    // Register
    await request(app).post("/auth/register").send({ email, password: "password123" });

    // Login Wrong Password
    const res = await request(app).post("/auth/login").send({
      email,
      password: "WRONG_PASSWORD"
    });

    expect(res.status).toBe(401);
  });
});