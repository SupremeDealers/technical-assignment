import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/index";
import { prisma } from "../src/db";
import bcryptjs from "bcryptjs";

describe("Boards API", () => {
  let token: string;
  let userId: string;
  let boardId: string;

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcryptjs.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        email: "board-test@example.com",
        password: hashedPassword,
        name: "Board Test User",
      },
    });

    userId = user.id;

    // Login to get token
    const loginRes = await request(app).post("/auth/login").send({
      email: "board-test@example.com",
      password: "password123",
    });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    // Clean up
    await prisma.board.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({
      where: { email: "board-test@example.com" },
    });
    await prisma.$disconnect();
  });

  describe("POST /boards", () => {
    it("should create a new board", async () => {
      const res = await request(app)
        .post("/boards")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Test Board",
        })
        .expect(201);

      expect(res.body.board).toBeDefined();
      expect(res.body.board.title).toBe("Test Board");
      boardId = res.body.board.id;
    });

    it("should return error without token", async () => {
      const res = await request(app)
        .post("/boards")
        .send({
          title: "Unauthorized Board",
        })
        .expect(401);

      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("should return error without title", async () => {
      const res = await request(app)
        .post("/boards")
        .set("Authorization", `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(res.body.error.code).toBe("BAD_REQUEST");
    });
  });

  describe("GET /boards", () => {
    it("should get all user boards", async () => {
      const res = await request(app)
        .get("/boards")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body.boards)).toBe(true);
      expect(res.body.boards.length).toBeGreaterThan(0);
      expect(res.body.boards[0].title).toBe("Test Board");
    });

    it("should return error without token", async () => {
      const res = await request(app).get("/boards").expect(401);

      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("GET /boards/:boardId", () => {
    it("should get board with columns and tasks", async () => {
      const res = await request(app)
        .get(`/boards/${boardId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.board).toBeDefined();
      expect(res.body.board.id).toBe(boardId);
      expect(Array.isArray(res.body.board.columns)).toBe(true);
    });

    it("should return 404 for nonexistent board", async () => {
      const res = await request(app)
        .get("/boards/nonexistent")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("PUT /boards/:boardId", () => {
    it("should update board title", async () => {
      const res = await request(app)
        .put(`/boards/${boardId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Updated Board Title",
        })
        .expect(200);

      expect(res.body.board.title).toBe("Updated Board Title");
    });
  });

  describe("DELETE /boards/:boardId", () => {
    let deleteboardId: string;

    beforeAll(async () => {
      // Create a board to delete
      const createRes = await request(app)
        .post("/boards")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Board to Delete",
        });

      deleteboardId = createRes.body.board.id;
    });

    it("should delete a board", async () => {
      const res = await request(app)
        .delete(`/boards/${deleteboardId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it("should return 404 when deleting nonexistent board", async () => {
      const res = await request(app)
        .delete("/boards/nonexistent")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });
});
