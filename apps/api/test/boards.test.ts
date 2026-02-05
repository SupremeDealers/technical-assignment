import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index";
import { getAuthToken } from "./helpers";

describe("Boards", () => {
  it("GET /boards/:boardId returns 401 without token", async () => {
    await request(app).get("/boards/1").expect(401);
  });

  it("GET /boards/:boardId returns board when authenticated", async () => {
    const token = await getAuthToken(app);
    const res = await request(app)
      .get("/boards/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(res.body).toMatchObject({ id: 1, title: "Team Board" });
    expect(res.body.createdAt).toBeDefined();
  });

  it("GET /boards/:boardId/columns returns columns when authenticated", async () => {
    const token = await getAuthToken(app);
    const res = await request(app)
      .get("/boards/1/columns")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /boards/:boardId/columns creates column when authenticated", async () => {
    const token = await getAuthToken(app);
    const res = await request(app)
      .post("/boards/1/columns")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New Column" })
      .expect(201);
    expect(res.body).toMatchObject({ title: "New Column", boardId: 1 });
    expect(res.body.id).toBeDefined();
    expect(res.body.position).toBeDefined();
  });

  it("GET /boards/999 returns 404 for non-existent board", async () => {
    const token = await getAuthToken(app);
    const res = await request(app)
      .get("/boards/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("Columns", () => {
  it("PATCH /columns/:columnId updates column title", async () => {
    const token = await getAuthToken(app);
    const createRes = await request(app)
      .post("/boards/1/columns")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Original" })
      .expect(201);
    const columnId = createRes.body.id;
    const res = await request(app)
      .patch(`/columns/${columnId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated title" })
      .expect(200);
    expect(res.body.title).toBe("Updated title");
  });

  it("DELETE /columns/:columnId removes column", async () => {
    const token = await getAuthToken(app);
    const createRes = await request(app)
      .post("/boards/1/columns")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "To remove" })
      .expect(201);
    const columnId = createRes.body.id;
    await request(app)
      .delete(`/columns/${columnId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
    const getCols = await request(app)
      .get("/boards/1/columns")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(getCols.body.find((c: { id: number }) => c.id === columnId)).toBeUndefined();
  });
});
