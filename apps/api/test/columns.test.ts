import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/index";
import { boards, columns } from "../src/routes/boards";

describe("Columns API", () => {
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

  describe("PATCH /columns/:columnId", () => {
    it("should update a column", async () => {
      const updates = {
        name: "Updated Column",
        position: 10,
      };

      const res = await request(app)
        .patch("/columns/1")
        .set("Authorization", `Bearer ${token}`)
        .send(updates)
        .expect(200);

      expect(res.body.name).toBe(updates.name);
      expect(res.body.position).toBe(updates.position);
    });

    it("should update only provided fields", async () => {
      const res = await request(app)
        .patch("/columns/2")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Partially Updated Column" })
        .expect(200);

      expect(res.body.name).toBe("Partially Updated Column");
      expect(res.body.position).toBe(1); // Should remain unchanged
    });

    it("should return 404 for non-existent column", async () => {
      await request(app)
        .patch("/columns/9999")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Non-existent Column" })
        .expect(404);
    });

    it("should reject invalid position", async () => {
      await request(app)
        .patch("/columns/1")
        .set("Authorization", `Bearer ${token}`)
        .send({ position: -1 })
        .expect(400);

      await request(app)
        .patch("/columns/1")
        .set("Authorization", `Bearer ${token}`)
        .send({ position: "invalid" })
        .expect(400);
    });
  });

  describe("DELETE /columns/:columnId", () => {
    it("should delete a column", async () => {
      await request(app)
        .delete("/columns/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Verify column is deleted
      const res = await request(app)
        .get("/boards/1/columns")
        .set("Authorization", `Bearer ${token}`);

      expect(res.body.some((col: any) => col.id === 1)).toBe(false);
    });

    it("should return 404 for non-existent column", async () => {
      await request(app)
        .delete("/columns/9999")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });
  });
});
