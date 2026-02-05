import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index";

describe("Validation", () => {
  describe("Auth", () => {
    it("POST /auth/register returns 400 for invalid email", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ email: "not-an-email", password: "password123", name: "User" })
        .expect(400);
      expect(res.body.error.code).toBe("BAD_REQUEST");
    });

    it("POST /auth/register returns 400 for short password", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ email: "a@b.com", password: "12345", name: "User" })
        .expect(400);
      expect(res.body.error.code).toBe("BAD_REQUEST");
    });

    it("POST /auth/register returns 400 for missing name", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ email: "a@b.com", password: "password123" })
        .expect(400);
      expect(res.body.error.code).toBe("BAD_REQUEST");
    });

    it("POST /auth/login returns 400 for invalid email", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "bad", password: "x" })
        .expect(400);
      expect(res.body.error.code).toBe("BAD_REQUEST");
    });

    it("POST /auth/login with unknown email returns 401", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "nobody@example.com", password: "anything" })
        .expect(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });
  });
});
