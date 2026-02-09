import { describe, it, expect, vi, beforeEach } from "vitest";
import { api, ApiError } from "../src/lib/api";

// Mock fetch
global.fetch = vi.fn();

describe("API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication", () => {
    it("registers a new user", async () => {
      const mockResponse = {
        user: { id: 1, email: "test@example.com", name: "Test User" },
        token: "test-token",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.register({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:4000/auth/register",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
            name: "Test User",
          }),
        })
      );
    });

    it("logs in a user", async () => {
      const mockResponse = {
        user: { id: 1, email: "test@example.com", name: "Test User" },
        token: "test-token",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe("Boards", () => {
    it("fetches board details with token", async () => {
      const mockBoard = {
        id: 1,
        title: "Test Board",
        description: "Test description",
        createdBy: { id: 1, name: "User", email: "user@example.com" },
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBoard,
      });

      const result = await api.getBoard(1, "test-token");

      expect(result).toEqual(mockBoard);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:4000/boards/1",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });

    it("fetches board columns", async () => {
      const mockColumns = {
        columns: [
          {
            id: 1,
            boardId: 1,
            title: "To Do",
            position: 0,
            taskCount: 5,
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockColumns,
      });

      const result = await api.getBoardColumns(1, "test-token");

      expect(result).toEqual(mockColumns);
    });
  });

  describe("Tasks", () => {
    it("fetches column tasks with pagination", async () => {
      const mockTasks = {
        tasks: [
          {
            id: 1,
            columnId: 1,
            title: "Test Task",
            description: null,
            priority: "medium",
            createdBy: { id: 1, name: "User", email: "user@example.com" },
            assignedTo: null,
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks,
      });

      const result = await api.getColumnTasks(
        1,
        { page: 1, limit: 20 },
        "test-token"
      );

      expect(result).toEqual(mockTasks);
    });

    it("creates a new task", async () => {
      const mockTask = {
        id: 1,
        columnId: 1,
        title: "New Task",
        description: "Task description",
        priority: "high",
        createdBy: { id: 1, name: "User", email: "user@example.com" },
        assignedTo: null,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
      });

      const result = await api.createTask(
        1,
        {
          title: "New Task",
          description: "Task description",
          priority: "high",
        },
        "test-token"
      );

      expect(result).toEqual(mockTask);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:4000/columns/1/tasks",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            title: "New Task",
            description: "Task description",
            priority: "high",
          }),
        })
      );
    });

    it("updates a task", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await api.updateTask(
        1,
        { title: "Updated Title", priority: "low" },
        "test-token"
      );

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:4000/tasks/1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ title: "Updated Title", priority: "low" }),
        })
      );
    });

    it("deletes a task", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await api.deleteTask(1, "test-token");

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:4000/tasks/1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  describe("Comments", () => {
    it("fetches task comments", async () => {
      const mockComments = {
        comments: [
          {
            id: 1,
            taskId: 1,
            content: "Test comment",
            user: { id: 1, name: "User", email: "user@example.com" },
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockComments,
      });

      const result = await api.getTaskComments(1, "test-token");

      expect(result).toEqual(mockComments);
    });

    it("creates a comment", async () => {
      const mockComment = {
        id: 1,
        taskId: 1,
        content: "New comment",
        user: { id: 1, name: "User", email: "user@example.com" },
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockComment,
      });

      const result = await api.createComment(
        1,
        { content: "New comment" },
        "test-token"
      );

      expect(result).toEqual(mockComment);
    });
  });

  describe("Error Handling", () => {
    it("throws ApiError on failed request", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            message: "Unauthorized",
            code: "UNAUTHORIZED",
          },
        }),
      });

      try {
        await api.login({ email: "test@example.com", password: "wrong" });
        // If we get here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        if (error instanceof ApiError) {
          expect(error.status).toBe(401);
          expect(error.code).toBe("UNAUTHORIZED");
          expect(error.message).toBe("Unauthorized");
        }
      }
    });

    it("handles 204 No Content responses", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await api.deleteTask(1, "test-token");

      expect(result).toBeUndefined();
    });
  });
});
