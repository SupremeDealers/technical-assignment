import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index";
import { getAuthToken } from "./helpers";

describe("Tasks", () => {
  it("GET /columns/:columnId/tasks returns 401 without token", async () => {
    await request(app).get("/columns/1/tasks").expect(401);
  });

  it("GET /tasks/:taskId returns 404 for non-existent task", async () => {
    const token = await getAuthToken(app);
    const res = await request(app)
      .get("/tasks/99999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
