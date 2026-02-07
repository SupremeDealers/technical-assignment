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

async function registerAndGetBoard(agent: request.SuperTest<request.Test>) {
  const res = await agent.post("/auth/register").send({
    name: "Rita",
    email: "rita@example.com",
    password: "password123",
  });
  return res.body.boardId as string;
}

describe("tasks list", () => {
  it("supports search and pagination", async () => {
    const agent = request.agent(app);
    const boardId = await registerAndGetBoard(agent);

    const columnsRes = await agent.get(`/boards/${boardId}/columns`);
    const columnId = columnsRes.body[0].id as string;

    await agent.post(`/columns/${columnId}/tasks`).send({ title: "Fix bug", description: "API" });
    await agent.post(`/columns/${columnId}/tasks`).send({ title: "Write docs" });
    await agent.post(`/columns/${columnId}/tasks`).send({ title: "Fix UI" });

    const searchRes = await agent.get(
      `/columns/${columnId}/tasks?search=Fix&limit=2&page=1`
    );
    expect(searchRes.body.total).toBe(2);
    expect(searchRes.body.items.length).toBe(2);

    const pageRes = await agent.get(
      `/columns/${columnId}/tasks?limit=2&page=2`
    );
    expect(pageRes.body.items.length).toBe(1);
  });
});
