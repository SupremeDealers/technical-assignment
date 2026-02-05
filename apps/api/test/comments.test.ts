import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index";

describe("Comments", () => {
  it("GET /tasks/:taskId/comments returns 401 without token", async () => {
    await request(app).get("/tasks/1/comments").expect(401);
  });
});
