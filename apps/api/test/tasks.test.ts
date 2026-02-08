import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/index";
import { db } from "../src/db";

describe("Tasks Endpoints", () => {
  let token: string;
  let columnId: string;

  beforeAll(async () => {
    // Login to get token
    const reg = await request(app)
      .post("/auth/register")
      .send({
        email: `task-test-${Date.now()}@example.com`,
        password: "password123",
      });
    token = reg.body.token;

    // Get a column from the seed or create one
    const board =
      (await db.board.findFirst()) ||
      (await db.board.create({ data: { name: "Test Board" } }));
    const col =
      (await db.column.findFirst()) ||
      (await db.column.create({
        data: { title: "Test Col", order: 1, boardId: board.id },
      }));
    columnId = col.id;
  });

  it("GET /columns/:columnId/tasks should return tasks", async () => {
    const res = await request(app)
      .get(`/columns/${columnId}/tasks`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tasks)).toBe(true);
  });

  it("POST /columns/:columnId/tasks should create a task", async () => {
    const res = await request(app)
      .post(`/columns/${columnId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New Test Task" });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("New Test Task");
  });

  afterAll(async () => {
    await db.$disconnect();
  });
});
