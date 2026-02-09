import request from "supertest";
import app from "../src/app";
import { beforeAll, expect, it } from "vitest";

let token: string;
let boardId: string;

beforeAll(async () => {
  const res = await request(app).post("/api/auth/login").send({
    email: "dmj@dev.co",
    password: "password123",
  });

  token = res.body.data.token;

  const boards = await request(app)
    .get("/api/boards")
    .set("Authorization", `Bearer ${token}`);

  boardId = boards.body[0].id;
});

it("returns paginated tasks", async () => {
  const res = await request(app)
    .get(`/api/boards/${boardId}/tasks?page=1&limit=5`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(200);
  expect(res.body.meta).toBeDefined();
  expect(res.body.tasks.length).toBeLessThanOrEqual(5);
});

it("rejects unauthenticated access", async () => {
  const res = await request(app).get(`/api/boards/${boardId}/tasks`);

  expect(res.status).toBe(401);
});
