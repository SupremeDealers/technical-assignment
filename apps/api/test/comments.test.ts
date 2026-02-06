import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/index";
import { tasks } from "../src/routes/tasks";
import { columns } from "../src/routes/columns";
import { boards } from "../src/routes/boards";

describe("Comments API", () => {
  // Test data
  let testUser: { email: string; password: string; name: string };
  let token: string;
  let testColumnId: number;
  let testTaskId: number;

  beforeEach(async () => {
    // Reset tasks, columns, and boards before each test
    tasks.length = 0;
    tasks.push(
      {
        id: 1,
        title: "Implement user authentication",
        description: "Add login and registration functionality",
        columnId: 1,
        userId: 1,
        priority: "high",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Create task board UI",
        description: "Design and implement the kanban board interface",
        columnId: 1,
        userId: 1,
        priority: "medium",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        title: "Add task comments",
        description: "Allow users to comment on tasks",
        columnId: 1,
        userId: 1,
        priority: "low",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 4,
        title: "Implement task drag and drop",
        description: "Add drag and drop functionality for tasks",
        columnId: 1,
        userId: 1,
        priority: "high",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 5,
        title: "Add task tags",
        description: "Allow users to add tags to tasks",
        columnId: 1,
        userId: 1,
        priority: "medium",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 6,
        title: "Implement task search",
        description: "Add search functionality for tasks",
        columnId: 1,
        userId: 1,
        priority: "low",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 7,
        title: "Add task filters",
        description: "Allow users to filter tasks by priority and status",
        columnId: 1,
        userId: 1,
        priority: "high",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    columns.length = 0;
    columns.push(
      {
        id: 1,
        name: "To Do",
        boardId: 1,
        position: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "In Progress",
        boardId: 1,
        position: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        name: "Done",
        boardId: 1,
        position: 2,
        createdAt: new Date().toISOString(),
      }
    );

    boards.length = 0;
    boards.push(
      {
        id: 1,
        name: "Sample Board",
        description: "This is a sample board for testing",
        createdAt: new Date().toISOString(),
      }
    );

    // Generate new test user for each test case
    testUser = {
      email: `testuser${Date.now()}@example.com`,
      password: "password123",
      name: "Test User",
    };

    // Register a test user
    await request(app)
      .post("/auth/register")
      .send(testUser)
      .expect(200);

    // Login to get token
    const loginRes = await request(app)
      .post("/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    token = loginRes.body.token;

    // Create a test column
    const columnRes = await request(app)
      .post("/boards/1/columns")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Column",
      })
      .expect(200);

    testColumnId = columnRes.body.id;

    // Create a test task
    const taskRes = await request(app)
      .post(`/tasks/columns/${testColumnId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task",
        description: "This is a test task",
        priority: "medium",
      })
      .expect(200);

    testTaskId = taskRes.body.id;
  });

  describe("GET /comments/tasks/:taskId/comments", () => {
    it("should get comments for a task", async () => {
      const res = await request(app)
        .get(`/comments/tasks/${testTaskId}/comments`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("POST /comments/tasks/:taskId/comments", () => {
    it("should create a new comment", async () => {
      const newComment = {
        content: "This is a test comment",
      };

      const res = await request(app)
        .post(`/comments/tasks/${testTaskId}/comments`)
        .set("Authorization", `Bearer ${token}`)
        .send(newComment)
        .expect(200);

      expect(res.body.content).toBe(newComment.content);
      expect(res.body.taskId).toBe(testTaskId);
    });

    it("should require content", async () => {
      await request(app)
        .post(`/comments/tasks/${testTaskId}/comments`)
        .set("Authorization", `Bearer ${token}`)
        .send({})
        .expect(400);
    });

    it("should return 404 for non-existent task", async () => {
      await request(app)
        .post("/comments/tasks/9999/comments")
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "This comment should fail" })
        .expect(404);
    });
  });
});
