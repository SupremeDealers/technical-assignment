import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/index";
import { boards, columns } from "../src/routes/boards";

describe("Boards API", () => {
  let testUser: { email: string; password: string; name: string };
  let token: string;

  beforeEach(async () => {
    // Reset data
    boards.length = 0;
    boards.push({
      id: 1,
      name: "Sample Board",
      description: "This is a sample board for testing",
      createdAt: new Date().toISOString(),
    });

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

    // Generate new test user
    testUser = {
      email: `testuser${Date.now()}@example.com`,
      password: "password123",
      name: "Test User",
    };

    // Register and login
    await request(app)
      .post("/auth/register")
      .send(testUser)
      .expect(200);

    const loginRes = await request(app)
      .post("/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    token = loginRes.body.token;
  });

  describe("GET /boards/:boardId", () => {
    it("should get a board by id", async () => {
      const res = await request(app)
        .get("/boards/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.id).toBe(1);
      expect(res.body.name).toBe("Sample Board");
      expect(res.body.description).toBe("This is a sample board for testing");
    });

    it("should return 404 for non-existent board", async () => {
      await request(app)
        .get("/boards/9999")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });
  });

  describe("GET /boards/:boardId/columns", () => {
    it("should get columns for a board", async () => {
      const res = await request(app)
        .get("/boards/1/columns")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
      expect(res.body[0].name).toBe("To Do");
      expect(res.body[1].name).toBe("In Progress");
      expect(res.body[2].name).toBe("Done");
    });

    it("should return empty array for board with no columns", async () => {
      // Create a new board (in real app, we'd have an endpoint for this)
      boards.push({
        id: 2,
        name: "Empty Board",
        description: "Board with no columns",
        createdAt: new Date().toISOString(),
      });

      const res = await request(app)
        .get("/boards/2/columns")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.length).toBe(0);
    });
  });

  describe("POST /boards/:boardId/columns", () => {
    it("should create a new column", async () => {
      const newColumn = { name: "Testing Column" };

      const res = await request(app)
        .post("/boards/1/columns")
        .set("Authorization", `Bearer ${token}`)
        .send(newColumn)
        .expect(200);

      expect(res.body.name).toBe(newColumn.name);
      expect(res.body.boardId).toBe(1);
      expect(typeof res.body.id).toBe("number");
    });

    it("should require column name", async () => {
      await request(app)
        .post("/boards/1/columns")
        .set("Authorization", `Bearer ${token}`)
        .send({})
        .expect(400);
    });
  });
});
