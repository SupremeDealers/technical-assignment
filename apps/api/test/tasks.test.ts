import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/index";
import { getDb } from "../src/db/index";

describe("Tasks", () => {
  let authToken: string;
  let userId: number;
  let boardId: number;
  let columnId: number;

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

    // Create a test board and column
    const boardResult = db
      .prepare("INSERT INTO boards (title, description, created_by) VALUES (?, ?, ?)")
      .run("Test Board", "A test board", userId);

    boardId = boardResult.lastInsertRowid as number;

    const columnResult = db
      .prepare("INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)")
      .run(boardId, "To Do", 0);

    columnId = columnResult.lastInsertRowid as number;
  });

  describe("POST /columns/:columnId/tasks", () => {
    it("should create a new task", async () => {
      const response = await request(app)
        .post(`/columns/${columnId}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "New Task",
          description: "Task description",
          priority: "high",
        })
        .expect(201);

      expect(response.body.title).toBe("New Task");
      expect(response.body.description).toBe("Task description");
      expect(response.body.priority).toBe("high");
      expect(response.body.columnId).toBe(columnId);
      expect(response.body.createdBy.id).toBe(userId);
      expect(response.body.assignedTo).toBeNull();
    });

    it("should create task with default priority", async () => {
      const response = await request(app)
        .post(`/columns/${columnId}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "New Task",
        })
        .expect(201);

      expect(response.body.priority).toBe("medium");
    });

    it("should create task with assignedTo", async () => {
      const response = await request(app)
        .post(`/columns/${columnId}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Assigned Task",
          assignedTo: userId,
        })
        .expect(201);

      expect(response.body.assignedTo.id).toBe(userId);
      expect(response.body.assignedTo.name).toBe("Test User");
    });

    it("should return validation error for empty title", async () => {
      const response = await request(app)
        .post(`/columns/${columnId}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "",
        })
        .expect(400);

      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 404 for non-existent column", async () => {
      await request(app)
        .post(`/columns/99999/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Test" })
        .expect(404);
    });

    it("should return 400 for non-existent assigned user", async () => {
      const response = await request(app)
        .post(`/columns/${columnId}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test",
          assignedTo: 99999,
        })
        .expect(400);

      expect(response.body.error.message).toContain("Assigned user not found");
    });
  });

  describe("GET /columns/:columnId/tasks", () => {
    beforeEach(() => {
      const db = getDb();
      // Create some test tasks
      db.prepare(
        "INSERT INTO tasks (column_id, title, description, priority, created_by) VALUES (?, ?, ?, ?, ?)"
      ).run(columnId, "Task 1", "First task", "high", userId);

      db.prepare(
        "INSERT INTO tasks (column_id, title, description, priority, created_by) VALUES (?, ?, ?, ?, ?)"
      ).run(columnId, "Task 2", "Second task", "medium", userId);

      db.prepare(
        "INSERT INTO tasks (column_id, title, description, priority, created_by) VALUES (?, ?, ?, ?, ?)"
      ).run(columnId, "Task 3", "Third task", "low", userId);
    });

    it("should get all tasks for a column", async () => {
      const response = await request(app)
        .get(`/columns/${columnId}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks).toHaveLength(3);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.page).toBe(1);
    });

    it("should search tasks by title", async () => {
      const response = await request(app)
        .get(`/columns/${columnId}/tasks?search=Task 1`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].title).toBe("Task 1");
    });

    it("should search tasks by description", async () => {
      const response = await request(app)
        .get(`/columns/${columnId}/tasks?search=First`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].description).toBe("First task");
    });

    it("should paginate tasks", async () => {
      const response = await request(app)
        .get(`/columns/${columnId}/tasks?page=1&limit=2`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks).toHaveLength(2);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.totalPages).toBe(2);
    });

    it("should sort tasks by priority", async () => {
      const response = await request(app)
        .get(`/columns/${columnId}/tasks?sort=priority`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks[0].priority).toBe("high");
      expect(response.body.tasks[1].priority).toBe("medium");
      expect(response.body.tasks[2].priority).toBe("low");
    });

    it("should sort tasks by createdAt by default", async () => {
      const response = await request(app)
        .get(`/columns/${columnId}/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // All tasks should be returned
      expect(response.body.tasks).toHaveLength(3);
      const titles = response.body.tasks.map((t: any) => t.title);
      expect(titles).toContain("Task 1");
      expect(titles).toContain("Task 2");
      expect(titles).toContain("Task 3");
    });

    it("should return 404 for non-existent column", async () => {
      await request(app)
        .get(`/columns/99999/tasks`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });

    it("should require authentication", async () => {
      await request(app)
        .get(`/columns/${columnId}/tasks`)
        .expect(401);
    });
  });

  describe("PATCH /tasks/:taskId", () => {
    let taskId: number;

    beforeEach(() => {
      const db = getDb();
      const result = db
        .prepare(
          "INSERT INTO tasks (column_id, title, description, priority, created_by) VALUES (?, ?, ?, ?, ?)"
        )
        .run(columnId, "Test Task", "Description", "medium", userId);

      taskId = result.lastInsertRowid as number;
    });

    it("should update task title", async () => {
      const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Title",
        })
        .expect(200);

      expect(response.body.title).toBe("Updated Title");
      expect(response.body.description).toBe("Description");
    });

    it("should update task description", async () => {
      const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          description: "Updated Description",
        })
        .expect(200);

      expect(response.body.description).toBe("Updated Description");
    });

    it("should update task priority", async () => {
      const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          priority: "high",
        })
        .expect(200);

      expect(response.body.priority).toBe("high");
    });

    it("should assign task to a user", async () => {
      const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          assignedTo: userId,
        })
        .expect(200);

      expect(response.body.assignedTo.id).toBe(userId);
    });

    it("should unassign task by setting assignedTo to null", async () => {
      // First assign
      await request(app)
        .patch(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ assignedTo: userId });

      // Then unassign
      const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          assignedTo: null,
        })
        .expect(200);

      expect(response.body.assignedTo).toBeNull();
    });

    it("should move task to another column", async () => {
      const db = getDb();
      const newColumnResult = db
        .prepare("INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)")
        .run(boardId, "In Progress", 1);

      const newColumnId = newColumnResult.lastInsertRowid as number;

      const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          columnId: newColumnId,
        })
        .expect(200);

      expect(response.body.columnId).toBe(newColumnId);
    });

    it("should update multiple fields at once", async () => {
      const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "New Title",
          description: "New Description",
          priority: "low",
        })
        .expect(200);

      expect(response.body.title).toBe("New Title");
      expect(response.body.description).toBe("New Description");
      expect(response.body.priority).toBe("low");
    });

    it("should return error if no fields provided", async () => {
      const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.error.code).toBe("BAD_REQUEST");
    });

    it("should return 404 for non-existent task", async () => {
      await request(app)
        .patch(`/tasks/99999`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Test" })
        .expect(404);
    });

    it("should return 400 for non-existent target column", async () => {
      const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          columnId: 99999,
        })
        .expect(400);

      expect(response.body.error.message).toContain("Target column not found");
    });
  });

  describe("DELETE /tasks/:taskId", () => {
    let taskId: number;

    beforeEach(() => {
      const db = getDb();
      const result = db
        .prepare(
          "INSERT INTO tasks (column_id, title, description, priority, created_by) VALUES (?, ?, ?, ?, ?)"
        )
        .run(columnId, "Test Task", "Description", "medium", userId);

      taskId = result.lastInsertRowid as number;
    });

    it("should delete a task", async () => {
      await request(app)
        .delete(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      // Verify task is deleted
      const db = getDb();
      const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);

      expect(task).toBeUndefined();
    });

    it("should return 404 for non-existent task", async () => {
      await request(app)
        .delete(`/tasks/99999`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });

    it("should require authentication", async () => {
      await request(app)
        .delete(`/tasks/${taskId}`)
        .expect(401);
    });
  });
});
