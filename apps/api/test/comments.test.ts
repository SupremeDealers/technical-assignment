import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";
import { ensureSchema, resetDb } from "./db";

beforeAll(async () => {
  await ensureSchema();
});

beforeEach(async () => {
  await resetDb();
});

describe("comments", () => {
  it("creates and lists comments", async () => {
    const agent = request.agent(app);
    const registerRes = await agent.post("/auth/register").send({
      name: "Lee",
      email: "lee@example.com",
      password: "password123",
    });
    const boardId = registerRes.body.boardId as string;
    const columnsRes = await agent.get(`/boards/${boardId}/columns`);
    const columnId = columnsRes.body[0].id as string;

    const taskRes = await agent.post(`/columns/${columnId}/tasks`).send({
      title: "Add comments",
    });
    const taskId = taskRes.body.id as string;

    const createRes = await agent
      .post(`/tasks/${taskId}/comments`)
      .send({ body: "First!" });
    expect(createRes.status).toBe(201);

    const listRes = await agent.get(`/tasks/${taskId}/comments`);
    expect(listRes.body.length).toBe(1);
    expect(listRes.body[0].body).toBe("First!");
  });
});
