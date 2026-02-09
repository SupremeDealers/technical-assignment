import request from "supertest";
import app from "../src/app";
import sequelize from "../src/config/database";
import { User, Board } from "../src/models";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
} from "vitest";

describe("Board API", () => {
  let token: string;
  let userId: string;

  // 2️⃣ Clean ONLY DATA after each test
  afterEach(async () => {
    await sequelize.truncate({ cascade: true });
  });

  // 4️⃣ Fresh user + token for each test group
  beforeEach(async () => {
    const user = await User.create({
      name: "Board Test User",
      email: "board@example.com",
      password: "password123",
    });

    userId = user.id;

    const response = await request(app).post("/api/auth/login").send({
      email: "board@example.com",
      password: "password123",
    });

    token = response.body.data.token;
  });

  describe("POST /api/boards", () => {
    it("should create a new board", async () => {
      const response = await request(app)
        .post("/api/boards")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Test Board" });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Test Board");
      expect(response.body.data.userId).toBe(userId);
    });

    it("should fail without authentication", async () => {
      const response = await request(app)
        .post("/api/boards")
        .send({ name: "Test Board" });

      expect(response.status).toBe(401);
    });

    it("should fail with empty name", async () => {
      const response = await request(app)
        .post("/api/boards")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/boards", () => {
    beforeEach(async () => {
      await Board.bulkCreate([
        { name: "Board 1", userId },
        { name: "Board 2", userId },
      ]);
    });

    it("should get all boards for authenticated user", async () => {
      const response = await request(app)
        .get("/api/boards")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });
  });

  describe("GET /api/boards/:id", () => {
    let boardId: string;

    beforeEach(async () => {
      const board = await Board.create({
        name: "Specific Board",
        userId,
      });
      boardId = board.toJSON().id;
    });

    it("should get board by id", async () => {
      const response = await request(app)
        .get(`/api/boards/${boardId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(boardId);
    });

    it("should fail with invalid board id", async () => {
      const response = await request(app)
        .get("/api/boards/invalid-id")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
    });

    it("should fail with non-existent board", async () => {
      const fakeId = "123e4567-e89b-12d3-a456-426614174000";
      const response = await request(app)
        .get(`/api/boards/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/boards/:id", () => {
    let boardId: string;

    beforeEach(async () => {
      const board = await Board.create({
        name: "Update Board",
        userId,
      });
      boardId = board.toJSON().id;
    });

    it("should update board name", async () => {
      const response = await request(app)
        .put(`/api/boards/${boardId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated Board Name" });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe("Updated Board Name");
    });
  });

  describe("DELETE /api/boards/:id", () => {
    let boardId: string;

    beforeEach(async () => {
      const board = await Board.create({
        name: "Delete Board",
        userId,
      });
      boardId = board.toJSON().id;
    });

    it("should delete board", async () => {
      const response = await request(app)
        .delete(`/api/boards/${boardId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      const board = await Board.findByPk(boardId);
      expect(board).toBeNull();
    });
  });
});
