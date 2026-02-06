import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index";

describe("GET /health", () => {
  it("returns ok status", async () => {
    const res = await request(app).get("/health").expect(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.message).toContain("healthy");
  });
});
