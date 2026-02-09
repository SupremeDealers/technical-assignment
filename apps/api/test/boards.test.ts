import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/index";
import { getDb } from "../src/db/index";

describe("Boards and Columns", () => {
  let authToken: string;
  let userId: number;
  let boardId: number;

  beforeEach(async () => {
    // Clear database
    const db = getDb();
    db.prepare("DELETE FROM comments").run();
    db.prepare("DELETE FROM tasks").run();
    db.prepare("DELETE FROM columns").run();
    db.prepare("DELETE FROM boards").run();
    db.prepare("DELETE FROM users").run();

    // Register and login a user
    const registerRes = await request(app).post("/auth/register").send({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });

    authToken = registerRes.body.token;
    userId = registerRes.body.user.id;

    // Create a test board
    const result = db
      .prepare("INSERT INTO boards (title, description, created_by) VALUES (?, ?, ?)")
      .run("Test Board", "A test board", userId);

    boardId = result.lastInsertRowid as number;
  });

  describe("GET /boards/:boardId", () => {
    it("should get board details with auth", async () => {
      const response = await request(app)
        .get(`/boards/${boardId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(boardId);
      expect(response.body.title).toBe("Test Board");
      expect(response.body.description).toBe("A test board");
      expect(response.body.createdBy.id).toBe(userId);
      expect(response.body.createdBy.name).toBe("Test User");
    });

    it("should return 401 without auth", async () => {
      await request(app).get(`/boards/${boardId}`).expect(401);
    });

    it("should return 404 for non-existent board", async () => {
      const response = await request(app)
        .get(`/boards/99999`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("GET /boards/:boardId/columns", () => {
    it("should get all columns for a board", async () => {
      const db = getDb();
      
      // Create some columns
      db.prepare("INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)")
        .run(boardId, "To Do", 0);
      db.prepare("INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)")
        .run(boardId, "In Progress", 1);
      db.prepare("INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)")
        .run(boardId, "Done", 2);

      const response = await request(app)
        .get(`/boards/${boardId}/columns`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.columns).toHaveLength(3);
      expect(response.body.columns[0].title).toBe("To Do");
      expect(response.body.columns[0].position).toBe(0);
      expect(response.body.columns[0].taskCount).toBe(0);
      expect(response.body.columns[1].title).toBe("In Progress");
      expect(response.body.columns[2].title).toBe("Done");
    });

    it("should return empty array for board with no columns", async () => {
      const response = await request(app)
        .get(`/boards/${boardId}/columns`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.columns).toHaveLength(0);
    });

    it("should return 404 for non-existent board", async () => {
      await request(app)
        .get(`/boards/99999/columns`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe("POST /boards/:boardId/columns", () => {
    it("should create a new column", async () => {
      const response = await request(app)
        .post(`/boards/${boardId}/columns`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "To Do",
        })
        .expect(201);

      expect(response.body.title).toBe("To Do");
      expect(response.body.boardId).toBe(boardId);
      expect(response.body.position).toBe(0);
      expect(response.body.taskCount).toBe(0);
    });

    it("should create column with custom position", async () => {
      const response = await request(app)
        .post(`/boards/${boardId}/columns`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Done",
          position: 5,
        })
        .expect(201);

      expect(response.body.title).toBe("Done");
      expect(response.body.position).toBe(5);
    });

    it("should auto-increment position if not provided", async () => {
      // Create first column
      await request(app)
        .post(`/boards/${boardId}/columns`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "First" });

      // Create second column without position
      const response = await request(app)
        .post(`/boards/${boardId}/columns`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Second" })
        .expect(201);

      expect(response.body.position).toBe(1);
    });

    it("should return validation error for empty title", async () => {
      const response = await request(app)
        .post(`/boards/${boardId}/columns`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "",
        })
        .expect(400);

      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 404 for non-existent board", async () => {
      await request(app)
        .post(`/boards/99999/columns`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Test" })
        .expect(404);
    });
  });

  describe("PATCH /columns/:columnId", () => {
    let columnId: number;

    beforeEach(() => {
      const db = getDb();
      const result = db
        .prepare("INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)")
        .run(boardId, "To Do", 0);
      columnId = result.lastInsertRowid as number;
    });

    it("should update column title", async () => {
      const response = await request(app)
        .patch(`/columns/${columnId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Title",
        })
        .expect(200);

      expect(response.body.title).toBe("Updated Title");
      expect(response.body.position).toBe(0);
    });

    it("should update column position", async () => {
      const response = await request(app)
        .patch(`/columns/${columnId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          position: 5,
        })
        .expect(200);

      expect(response.body.position).toBe(5);
      expect(response.body.title).toBe("To Do");
    });

    it("should update both title and position", async () => {
      const response = await request(app)
        .patch(`/columns/${columnId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "New Title",
          position: 3,
        })
        .expect(200);

      expect(response.body.title).toBe("New Title");
      expect(response.body.position).toBe(3);
    });

    it("should return error if no fields provided", async () => {
      const response = await request(app)
        .patch(`/columns/${columnId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.error.code).toBe("BAD_REQUEST");
    });

    it("should return 404 for non-existent column", async () => {
      await request(app)
        .patch(`/columns/99999`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Test" })
        .expect(404);
    });
  });

  describe("DELETE /columns/:columnId", () => {
    let columnId: number;

    beforeEach(() => {
      const db = getDb();
      const result = db
        .prepare("INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)")
        .run(boardId, "To Do", 0);
      columnId = result.lastInsertRowid as number;
    });

    it("should delete a column", async () => {
      await request(app)
        .delete(`/columns/${columnId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      // Verify column is deleted
      const db = getDb();
      const column = db
        .prepare("SELECT * FROM columns WHERE id = ?")
        .get(columnId);

      expect(column).toBeUndefined();
    });

    it("should return 404 for non-existent column", async () => {
      await request(app)
        .delete(`/columns/99999`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });

    it("should require authentication", async () => {
      await request(app)
        .delete(`/columns/${columnId}`)
        .expect(401);
    });
  });
});
