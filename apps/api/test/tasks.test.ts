import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/index";
import { tasks, state } from "../src/routes/tasks";
import { columns } from "../src/routes/columns";
import { boards } from "../src/routes/boards";

describe("Tasks API", () => {
  // Test data
  let testUser: { email: string; password: string; name: string };
  let token: string;
  let testColumnId: number;

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

    // Reset nextTaskId
    state.nextTaskId = 8;

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
  });

  describe("GET /tasks/columns/:columnId/tasks", () => {
    it("should get tasks for a column", async () => {
      const res = await request(app)
        .get(`/tasks/columns/${testColumnId}/tasks`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body.tasks)).toBe(true);
      expect(typeof res.body.page).toBe("number");
      expect(typeof res.body.limit).toBe("number");
      expect(typeof res.body.totalPages).toBe("number");
      expect(typeof res.body.total).toBe("number");
    });

    it("should get tasks with pagination", async () => {
      // Create 10 tasks
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post(`/tasks/columns/${testColumnId}/tasks`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            title: `Task ${i}`,
            description: `Description for task ${i}`,
            priority: i % 3 === 0 ? "high" : i % 3 === 1 ? "medium" : "low",
          });
      }

      // Get first page (5 tasks)
      const res = await request(app)
        .get(`/tasks/columns/${testColumnId}/tasks?page=1&limit=5`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.tasks.length).toBe(5);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(5);
      expect(res.body.totalPages).toBe(2);
      expect(res.body.total).toBe(10);
    });

    it("should search tasks", async () => {
      await request(app)
        .post(`/tasks/columns/${testColumnId}/tasks`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Test Search Task",
          description: "This is a test search task",
          priority: "medium",
        });

      const res = await request(app)
        .get(`/tasks/columns/${testColumnId}/tasks?search=Test Search Task`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.tasks.length).toBe(1);
      expect(res.body.tasks[0].title).toContain("Test Search Task");
    });
  });

  describe("POST /tasks/columns/:columnId/tasks", () => {
    it("should create a new task", async () => {
      const newTask = {
        title: "New Test Task",
        description: "This is a new test task",
        priority: "high",
      };

      const res = await request(app)
        .post(`/tasks/columns/${testColumnId}/tasks`)
        .set("Authorization", `Bearer ${token}`)
        .send(newTask)
        .expect(200);

      expect(res.body.title).toBe(newTask.title);
      expect(res.body.description).toBe(newTask.description);
      expect(res.body.priority).toBe(newTask.priority);
      expect(res.body.columnId).toBe(testColumnId);
    });

    it("should require title", async () => {
      await request(app)
        .post(`/tasks/columns/${testColumnId}/tasks`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          description: "This is a task without title",
          priority: "medium",
        })
        .expect(400);
    });
  });

  describe("PUT /tasks/:taskId", () => {
    it("should update a task", async () => {
      // Create a task first
      const createRes = await request(app)
        .post(`/tasks/columns/${testColumnId}/tasks`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Task to Update",
          description: "This task will be updated",
          priority: "low",
        });
      console.log("Create task response:", createRes.body);

      const taskId = createRes.body.id;

      // Update the task
      const updateRes = await request(app)
        .put(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Updated Task",
          description: "This task has been updated",
          priority: "high",
        })
        .expect(200);

      expect(updateRes.body.title).toBe("Updated Task");
      expect(updateRes.body.description).toBe("This task has been updated");
      expect(updateRes.body.priority).toBe("high");
    });

    it("should return 404 for non-existent task", async () => {
      await request(app)
        .put("/tasks/9999")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Non-existent Task" })
        .expect(404);
    });
  });

  describe("DELETE /tasks/:taskId", () => {
    it("should delete a task", async () => {
      // Create a task first
      const createRes = await request(app)
        .post(`/tasks/columns/${testColumnId}/tasks`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Task to Delete",
          description: "This task will be deleted",
          priority: "medium",
        });

      const taskId = createRes.body.id;

      // Delete the task
      await request(app)
        .delete(`/tasks/${taskId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Verify task is deleted
      const res = await request(app)
        .get(`/tasks/columns/${testColumnId}/tasks`)
        .set("Authorization", `Bearer ${token}`);

      const taskExists = res.body.tasks.some((task: any) => task.id === taskId);
      expect(taskExists).toBe(false);
    });

    it("should return 404 for non-existent task", async () => {
      await request(app)
        .delete("/tasks/9999")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });
  });
});
