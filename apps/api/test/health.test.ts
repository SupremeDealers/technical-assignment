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

describe('GET /tasks', () => {
  it('returns tasks', async () => {
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)
  })
})
