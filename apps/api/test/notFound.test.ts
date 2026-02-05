import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index";
import { getAuthToken } from "./helpers";

describe("404", () => {
  it("returns 404 for unknown route", async () => {
    const res = await request(app).get("/unknown/route").expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(res.body.error.message).toContain("Route not found");
  });

  it("returns 404 for unknown method on known path", async () => {
    const token = await getAuthToken(app);
    const res = await request(app)
      .patch("/boards/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
