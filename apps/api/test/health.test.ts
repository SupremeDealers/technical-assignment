import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/index";

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/health").expect(200);
    expect(res.body.ok).toBe(true);
    expect(typeof res.body.ts).toBe("string");
  });
});

describe("AuthZ ownership", () => {
  it("prevents access to another user's task", async () => {
    const emailA = `a-${Date.now()}@example.com`;
    const emailB = `b-${Date.now()}@example.com`;
    const password = "Pwd@1234";

    const regA = await request(app)
      .post("/auth/register")
      .send({ email: emailA, password })
      .expect(201);

    const tokenA = regA.body.token;

    const boardA = await request(app)
      .get("/boards/me")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);

    const colA = boardA.body.columns?.[0]?.id;

    const created = await request(app)
      .post(`/columns/${colA}/tasks`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "Private" })
      .expect(201);

    const taskId = created.body.id;

    const regB = await request(app)
      .post("/auth/register")
      .send({ email: emailB, password })
      .expect(201);

    const tokenB = regB.body.token;

    await request(app)
      .get(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(404);
  });
});

describe("GET /columns/:columnId/tasks", () => {
  let token: string;
  let columnId: number;

  beforeAll(async () => {
    const email = `test-${Date.now()}@example.com`;
    const password = "Pwd@1234";

    const registerRes = await request(app)
      .post("/auth/register")
      .send({ email, password })
      .expect(201);

    token = registerRes.body.token;

    const boardRes = await request(app)
      .get("/boards/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    columnId = boardRes.body.columns?.[0]?.id;
  });

  it("rejects unauthenticated requests", async () => {
    await request(app).get(`/columns/${columnId}/tasks`).expect(401);
  });

  it("returns tasks", async () => {
    await request(app)
      .post(`/columns/${columnId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test task" })
      .expect(201);

    const res = await request(app)
      .get(`/columns/${columnId}/tasks?page=1&limit=20&sort=order`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toMatchObject({
      page: 1,
      limit: 20,
    });
    expect(typeof res.body.total).toBe("number");
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items.some((t: any) => t?.title === "Test task")).toBe(true);
  });

  it("supports pagination", async () => {
    await request(app)
      .post(`/columns/${columnId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Paginate A" })
      .expect(201);

    await request(app)
      .post(`/columns/${columnId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Paginate B" })
      .expect(201);

    const page1 = await request(app)
      .get(`/columns/${columnId}/tasks?page=1&limit=1&sort=order`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const page2 = await request(app)
      .get(`/columns/${columnId}/tasks?page=2&limit=1&sort=order`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(page1.body.items).toHaveLength(1);
    expect(page2.body.items).toHaveLength(1);
    expect(page1.body.items[0].id).not.toBe(page2.body.items[0].id);
  });

  it("supports search", async () => {
    await request(app)
      .post(`/columns/${columnId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Alpha unique" })
      .expect(201);

    await request(app)
      .post(`/columns/${columnId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Beta" })
      .expect(201);

    const res = await request(app)
      .get(`/columns/${columnId}/tasks?search=Alpha&page=1&limit=50&sort=order`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.items.some((t: any) => t?.title?.includes("Alpha"))).toBe(true);
    expect(res.body.items.some((t: any) => t?.title === "Beta")).toBe(false);
  });

  it("allows creating and fetching comments for an owned task", async () => {
    const created = await request(app)
      .post(`/columns/${columnId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Task with comments" })
      .expect(201);

    const taskId = created.body.id;

    await request(app)
      .post(`/tasks/${taskId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Hello" })
      .expect(201);

    const res = await request(app)
      .get(`/tasks/${taskId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((c: any) => c?.content === "Hello")).toBe(true);
  });
});
