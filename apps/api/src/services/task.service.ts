import db from "../db/client";
import { ServiceError } from "../utils/errors";
import {
  createColumnSchema,
  createTaskSchema,
  updateColumnSchema,
  updateTaskSchema,
} from "../validation/task.schema";
import { z } from "zod";

type TaskSort = "order" | "createdAt" | "priority";

type ListTasksQuery = {
  search: string;
  page: number;
  limit: number;
  sort: TaskSort;
};

const assertBoardOwned = (userId: number, boardId: number) => {
  const board: any = db
    .prepare("SELECT * FROM boards WHERE id = ? AND owner_id = ?")
    .get(boardId, userId);
  if (!board) throw new ServiceError(404, "NOT_FOUND", "Board not found");
  return board;
};

const assertColumnOwned = (userId: number, columnId: number) => {
  const row: any = db
    .prepare(
      `
      SELECT c.id as column_id, c.board_id
      FROM columns c
      JOIN boards b ON b.id = c.board_id
      WHERE c.id = ? AND b.owner_id = ?
      `,
    )
    .get(columnId, userId);
  if (!row) throw new ServiceError(404, "NOT_FOUND", "Column not found");
  return row;
};

const assertTaskOwned = (userId: number, taskId: number) => {
  const row: any = db
    .prepare(
      `
      SELECT t.*, c.board_id
      FROM tasks t
      JOIN columns c ON c.id = t.column_id
      JOIN boards b ON b.id = c.board_id
      WHERE t.id = ? AND b.owner_id = ?
      `,
    )
    .get(taskId, userId);
  if (!row) throw new ServiceError(404, "NOT_FOUND", "Task not found");
  return row;
};

export const getBoard = (userId: number) => {
  const board: any = db
    .prepare("SELECT * FROM boards WHERE owner_id = ?")
    .get(userId);
  if (!board) throw new ServiceError(404, "NOT_FOUND", "Board not found");

  const columns: any[] = db
    .prepare('SELECT * FROM columns WHERE board_id = ? ORDER BY "order" ASC')
    .all(board.id);
  return { ...board, columns };
};

export const getBoardById = (userId: number, boardId: number) => {
  const board = assertBoardOwned(userId, boardId);
  const columns: any[] = db
    .prepare('SELECT * FROM columns WHERE board_id = ? ORDER BY "order" ASC')
    .all(board.id);
  return { ...board, columns };
};

export const getBoardColumns = (userId: number, boardId: number) => {
  assertBoardOwned(userId, boardId);
  return db
    .prepare(
      `
      SELECT c.*, (
        SELECT COUNT(*) FROM tasks t WHERE t.column_id = c.id
      ) AS tasks_count
      FROM columns c
      WHERE c.board_id = ?
      ORDER BY c."order" ASC
      `,
    )
    .all(boardId);
};

export const createColumn = (
  userId: number,
  boardId: number,
  data: z.infer<typeof createColumnSchema>,
) => {
  const board = assertBoardOwned(userId, boardId);
  const title = data?.title;
  const explicitOrder = data?.order;

  const maxOrder: any = db
    .prepare('SELECT MAX("order") as max FROM columns WHERE board_id = ?')
    .get(board.id);
  const nextOrder =
    typeof explicitOrder === "number"
      ? explicitOrder
      : (maxOrder.max ?? -1) + 1;

  const insert = db.prepare(
    'INSERT INTO columns (board_id, title, "order") VALUES (?, ?, ?)',
  );
  const result = insert.run(board.id, title, nextOrder);

  return db
    .prepare("SELECT * FROM columns WHERE id = ?")
    .get(result.lastInsertRowid);
};

export const updateColumn = (
  userId: number,
  columnId: number,
  data: z.infer<typeof updateColumnSchema>,
) => {
  assertColumnOwned(userId, columnId);

  const updates: string[] = [];
  const values: any[] = [];

  if (data?.title !== undefined) {
    updates.push("title = ?");
    values.push(data.title);
  }
  if (data?.order !== undefined) {
    updates.push('"order" = ?');
    values.push(data.order);
  }

  if (updates.length === 0)
    return db.prepare("SELECT * FROM columns WHERE id = ?").get(columnId);

  values.push(columnId);
  db.prepare(`UPDATE columns SET ${updates.join(", ")} WHERE id = ?`).run(
    ...values,
  );
  return db.prepare("SELECT * FROM columns WHERE id = ?").get(columnId);
};

export const deleteColumn = (userId: number, columnId: number) => {
  assertColumnOwned(userId, columnId);

  const tx = db.transaction(() => {
    const tasks = db
      .prepare("SELECT id FROM tasks WHERE column_id = ?")
      .all(columnId) as Array<{ id: number }>;

    if (tasks.length > 0) {
      const ids = tasks.map((t) => t.id);
      const placeholders = ids.map(() => "?").join(",");
      db.prepare(`DELETE FROM comments WHERE task_id IN (${placeholders})`).run(
        ...ids,
      );
      db.prepare(`DELETE FROM tasks WHERE id IN (${placeholders})`).run(...ids);
    }

    db.prepare("DELETE FROM columns WHERE id = ?").run(columnId);
  });

  tx();
};

export const getTasks = (
  userId: number,
  columnId: number,
  query: ListTasksQuery,
) => {
  assertColumnOwned(userId, columnId);

  const search = query.search.trim();
  const where: string[] = ["column_id = ?"];
  const args: any[] = [columnId];

  if (search.length > 0) {
    where.push("(title LIKE ? OR description LIKE ?)");
    const like = `%${search.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
    args.push(like, like);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const totalRow: any = db
    .prepare(`SELECT COUNT(*) as total FROM tasks ${whereSql}`)
    .get(...args);
  const total = Number(totalRow?.total ?? 0);

  let orderBy = '"order" ASC';
  if (query.sort === "createdAt") orderBy = "created_at DESC";
  if (query.sort === "priority") {
    orderBy =
      "CASE priority WHEN 'HIGH' THEN 0 WHEN 'MEDIUM' THEN 1 WHEN 'LOW' THEN 2 ELSE 3 END ASC, created_at DESC";
  }

  const offset = (query.page - 1) * query.limit;

  const items = db
    .prepare(
      `
      SELECT *
      FROM tasks
      ${whereSql}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
      `,
    )
    .all(...args, query.limit, offset);

  return {
    items,
    page: query.page,
    limit: query.limit,
    total,
  };
};

export const getTaskById = (userId: number, taskId: number) => {
  const task = assertTaskOwned(userId, taskId);
  return task;
};

export const createTask = (
  userId: number,
  columnId: number,
  data: z.infer<typeof createTaskSchema>,
) => {
  assertColumnOwned(userId, columnId);

  const { title, description, priority } = data;

  const maxOrder: any = db
    .prepare('SELECT MAX("order") as max FROM tasks WHERE column_id = ?')
    .get(columnId);
  const newOrder = (maxOrder.max ?? -1) + 1;

  const insert = db.prepare(
    'INSERT INTO tasks (column_id, title, description, priority, "order") VALUES (?, ?, ?, ?, ?)',
  );
  const result = insert.run(columnId, title, description, priority, newOrder);

  return db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(result.lastInsertRowid);
};

export const updateTask = (
  userId: number,
  taskId: number,
  data: z.infer<typeof updateTaskSchema>,
) => {
  const current = assertTaskOwned(userId, taskId);

  const { title, description, priority, columnId, order } = data;

  if (typeof columnId === "number" && columnId !== current.column_id) {
    assertColumnOwned(userId, columnId);
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (title !== undefined) {
    updates.push("title = ?");
    values.push(title);
  }
  if (description !== undefined) {
    updates.push("description = ?");
    values.push(description);
  }
  if (priority !== undefined) {
    updates.push("priority = ?");
    values.push(priority);
  }
  if (columnId !== undefined) {
    updates.push("column_id = ?");
    values.push(columnId);
  }
  if (order !== undefined) {
    updates.push('"order" = ?');
    values.push(order);
  }

  if (updates.length === 0)
    return db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);

  values.push(taskId);
  db.prepare(
    `UPDATE tasks SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
  ).run(...values);

  return db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);
};

export const deleteTask = (userId: number, taskId: number) => {
  assertTaskOwned(userId, taskId);
  db.prepare("DELETE FROM comments WHERE task_id = ?").run(taskId);
  db.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);
};
