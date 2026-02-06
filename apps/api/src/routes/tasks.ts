import express from "express";
import { authMiddleware } from "../auth/middleware";
import { sendError } from "../errors";

const router = express.Router();

// Temporary in-memory storage
interface Task {
  id: number;
  title: string;
  description: string;
  columnId: number;
  userId: number;
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

let tasks: Task[] = [
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
  },
];

export const state = {
  nextTaskId: 8,
};
console.log("Initial tasks:", tasks);

export { tasks };

const updateTask = (req: any, res: any) => {
  const taskId = parseInt(req.params.taskId);
  console.log("Update task request - taskId:", taskId);
  console.log("Current tasks in tasks array:", JSON.stringify(tasks, null, 2));
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Task not found",
    });
  }

  const { title, description, columnId, priority } = req.body;

  if (title !== undefined) {
    if (!title || title.trim() === "") {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Task title cannot be empty",
      });
    }
    tasks[taskIndex].title = title.trim();
  }

  if (description !== undefined) {
    tasks[taskIndex].description = description.trim();
  }

  if (columnId !== undefined) {
    tasks[taskIndex].columnId = parseInt(columnId);
  }

  if (priority !== undefined) {
    if (!["low", "medium", "high"].includes(priority)) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Priority must be one of: low, medium, high",
      });
    }
    tasks[taskIndex].priority = priority as "low" | "medium" | "high";
  }

  tasks[taskIndex].updatedAt = new Date().toISOString();
  res.json(tasks[taskIndex]);
};

router.get("/columns/:columnId/tasks", authMiddleware, (req, res) => {
  const columnId = parseInt(req.params.columnId);
  const { search = "", page = "1", limit = "10", sort = "createdAt" } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  // Filter tasks
  let filteredTasks = tasks.filter((task) => {
    if (task.columnId !== columnId) return false;
    const searchStr = search as string;
    if (searchStr) {
      const searchLower = searchStr.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  // Sort tasks
  filteredTasks.sort((a, b) => {
    if (sort === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Paginate
  const paginatedTasks = filteredTasks.slice(offset, offset + limitNum);

  res.json({
    tasks: paginatedTasks,
    total: filteredTasks.length,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(filteredTasks.length / limitNum),
  });
});

router.post("/columns/:columnId/tasks", authMiddleware, (req, res) => {
  const columnId = parseInt(req.params.columnId);
  const { title, description = "", priority = "medium" } = req.body;

  if (!title || title.trim() === "") {
    return sendError(res, 400, {
      code: "BAD_REQUEST",
      message: "Task title is required",
    });
  }

  const task: Task = {
    id: state.nextTaskId++,
    title: title.trim(),
    description: description.trim(),
    columnId,
    userId: (req as any).user.userId,
    priority: priority as "low" | "medium" | "high",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tasks.push(task);
  console.log("Added task:", task);
  res.json(task);
});

router.patch("/:taskId", authMiddleware, updateTask);
router.put("/:taskId", authMiddleware, updateTask);

router.delete("/:taskId", authMiddleware, (req, res) => {
  const taskId = parseInt(req.params.taskId);
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Task not found",
    });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.json(deletedTask);
});

export default router;
