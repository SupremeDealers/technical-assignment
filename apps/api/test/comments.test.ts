import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/index";
import { getDb } from "../src/db/index";

describe("Comments", () => {
  let authToken: string;
  let userId: number;
  let boardId: number;
  let columnId: number;
  let taskId: number;

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

    // Create test data
    const boardResult = db
      .prepare("INSERT INTO boards (title, description, created_by) VALUES (?, ?, ?)")
      .run("Test Board", "A test board", userId);

    boardId = boardResult.lastInsertRowid as number;

    const columnResult = db
      .prepare("INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)")
      .run(boardId, "To Do", 0);

    columnId = columnResult.lastInsertRowid as number;

    const taskResult = db
      .prepare(
        "INSERT INTO tasks (column_id, title, description, priority, created_by) VALUES (?, ?, ?, ?, ?)"
      )
      .run(columnId, "Test Task", "Description", "medium", userId);

    taskId = taskResult.lastInsertRowid as number;
  });

  describe("POST /tasks/:taskId/comments", () => {
    it("should create a new comment", async () => {
      const response = await request(app)
        .post(`/tasks/${taskId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "This is a test comment",
        })
        .expect(201);

      expect(response.body.content).toBe("This is a test comment");
      expect(response.body.taskId).toBe(taskId);
      expect(response.body.user.id).toBe(userId);
      expect(response.body.user.name).toBe("Test User");
      expect(response.body).toHaveProperty("createdAt");
      expect(response.body).toHaveProperty("updatedAt");
    });

    it("should return validation error for empty content", async () => {
      const response = await request(app)
        .post(`/tasks/${taskId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "",
        })
        .expect(400);

      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return validation error for missing content", async () => {
      const response = await request(app)
        .post(`/tasks/${taskId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 404 for non-existent task", async () => {
      const response = await request(app)
        .post(`/tasks/99999/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "Test comment",
        })
        .expect(404);

      expect(response.body.error.code).toBe("NOT_FOUND");
    });

    it("should require authentication", async () => {
      await request(app)
        .post(`/tasks/${taskId}/comments`)
        .send({
          content: "Test comment",
        })
        .expect(401);
    });

    it("should return 400 for invalid task ID", async () => {
      const response = await request(app)
        .post(`/tasks/invalid/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "Test comment",
        })
        .expect(400);

      expect(response.body.error.code).toBe("BAD_REQUEST");
    });
  });

  describe("GET /tasks/:taskId/comments", () => {
    beforeEach(() => {
      const db = getDb();
      // Create some test comments
      db.prepare("INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)")
        .run(taskId, userId, "First comment");

      db.prepare("INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)")
        .run(taskId, userId, "Second comment");

      db.prepare("INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)")
        .run(taskId, userId, "Third comment");
    });

    it("should get all comments for a task", async () => {
      const response = await request(app)
        .get(`/tasks/${taskId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.comments).toHaveLength(3);
      expect(response.body.comments[0].content).toBe("First comment");
      expect(response.body.comments[1].content).toBe("Second comment");
      expect(response.body.comments[2].content).toBe("Third comment");
    });

    it("should return comments with user info", async () => {
      const response = await request(app)
        .get(`/tasks/${taskId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.comments[0].user.id).toBe(userId);
      expect(response.body.comments[0].user.name).toBe("Test User");
      expect(response.body.comments[0].user.email).toBe("test@example.com");
    });

    it("should return comments ordered by creation time (oldest first)", async () => {
      const response = await request(app)
        .get(`/tasks/${taskId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // First comment should be the oldest
      expect(response.body.comments[0].content).toBe("First comment");
      expect(response.body.comments[2].content).toBe("Third comment");
    });

    it("should return empty array for task with no comments", async () => {
      // Create a new task without comments
      const db = getDb();
      const newTaskResult = db
        .prepare(
          "INSERT INTO tasks (column_id, title, description, priority, created_by) VALUES (?, ?, ?, ?, ?)"
        )
        .run(columnId, "Empty Task", "No comments", "low", userId);

      const newTaskId = newTaskResult.lastInsertRowid as number;

      const response = await request(app)
        .get(`/tasks/${newTaskId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.comments).toHaveLength(0);
    });

    it("should return 404 for non-existent task", async () => {
      const response = await request(app)
        .get(`/tasks/99999/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error.code).toBe("NOT_FOUND");
    });

    it("should require authentication", async () => {
      await request(app)
        .get(`/tasks/${taskId}/comments`)
        .expect(401);
    });

    it("should return 400 for invalid task ID", async () => {
      const response = await request(app)
        .get(`/tasks/invalid/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error.code).toBe("BAD_REQUEST");
    });

    it("should handle comments from multiple users", async () => {
      // Register another user
      const secondUserRes = await request(app).post("/auth/register").send({
        email: "user2@example.com",
        password: "password123",
        name: "Second User",
      });

      const secondUserId = secondUserRes.body.user.id;

      // Add a comment from the second user
      const db = getDb();
      db.prepare("INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)")
        .run(taskId, secondUserId, "Comment from second user");

      const response = await request(app)
        .get(`/tasks/${taskId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.comments).toHaveLength(4);
      
      // Find the comment from the second user
      const secondUserComment = response.body.comments.find(
        (c: any) => c.user.id === secondUserId
      );
      
      expect(secondUserComment).toBeDefined();
      expect(secondUserComment.user.name).toBe("Second User");
      expect(secondUserComment.content).toBe("Comment from second user");
    });
  });
});
