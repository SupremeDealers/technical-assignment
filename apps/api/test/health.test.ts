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

describe("Auth endpoints", () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: "testpass123",
    name: "Test User",
  };
  let authToken: string;

  describe("POST /auth/register", () => {
    it("creates a new user and returns token", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send(testUser)
        .expect(201);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.name).toBe(testUser.name);
      expect(res.body.token).toBeDefined();
      authToken = res.body.token;
    });

    it("returns 409 for duplicate email", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send(testUser)
        .expect(409);

      expect(res.body.error.code).toBe("CONFLICT");
    });

    it("returns 400 for invalid payload", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ email: "invalid" })
        .expect(400);

      expect(res.body.error.code).toBe("BAD_REQUEST");
      expect(res.body.error.details).toBeDefined();
    });
  });

  describe("POST /auth/login", () => {
    it("returns token for valid credentials", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(res.body.user).toBeDefined();
      expect(res.body.token).toBeDefined();
    });

    it("returns 401 for invalid credentials", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: testUser.email, password: "wrongpassword" })
        .expect(401);

      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("GET /auth/me", () => {
    it("returns current user with valid token", async () => {
      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.user.email).toBe(testUser.email);
    });

    it("returns 401 without token", async () => {
      const res = await request(app).get("/auth/me").expect(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });
  });
});

describe("Protected routes", () => {
  it("returns 401 for boards without auth", async () => {
    const res = await request(app).get("/boards").expect(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
});

describe("404 handling", () => {
  it("returns 401 for protected routes without auth", async () => {
    const res = await request(app).get("/boards/nonexistent").expect(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
});
