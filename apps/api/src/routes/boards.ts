import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";
import { createBoardSchema, updateBoardSchema, addBoardMemberSchema, updateBoardMemberSchema } from "../schemas";
import { sendError } from "../errors";
import db from "../db";
import { authenticate, requireAdmin, checkBoardAccess, canManageBoard, canManageMembers, getBoardRole, type AuthRequest } from "../middleware/auth";
import type { Board, BoardWithDetails, ColumnWithTaskCount, UserPublic, BoardMemberWithUser } from "../types";

const router = Router();

router.use(authenticate);

function formatZodErrors(error: z.ZodError) {
  return error.issues.map((e) => ({
    path: e.path.join("."),
    issue: e.message,
  }));
}

router.get("/", (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const boards = db
      .prepare(
        `
        SELECT DISTINCT b.* FROM boards b
        LEFT JOIN board_members bm ON b.id = bm.board_id
        WHERE b.owner_id = ? OR bm.user_id = ?
        ORDER BY b.created_at DESC
      `
      )
      .all(userId, userId) as Board[];

    res.json({ boards });
  } catch (error) {
    console.error("Get boards error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

// Only admin users can create new boards
router.post("/", requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const data = createBoardSchema.parse(req.body);
    const userId = req.user!.id;

    const boardId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO boards (id, name, description, owner_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(boardId, data.name, data.description || null, userId, now, now);

    const columns = ["To Do", "In Progress", "Done"];
    columns.forEach((name, index) => {
      const columnId = uuidv4();
      db.prepare(
        `INSERT INTO columns (id, board_id, name, position, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(columnId, boardId, name, index, now, now);
    });

    const board: Board = {
      id: boardId,
      name: data.name,
      description: data.description || null,
      owner_id: userId,
      created_at: now,
      updated_at: now,
    };

    res.status(201).json({ board });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: formatZodErrors(error),
      });
    }
    console.error("Create board error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.get("/:boardId", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;

    if (!checkBoardAccess(userId, boardId)) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    const board = db.prepare("SELECT * FROM boards WHERE id = ?").get(boardId) as Board | undefined;

    if (!board) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    const owner = db
      .prepare("SELECT id, email, name, created_at FROM users WHERE id = ?")
      .get(board.owner_id) as UserPublic;

    const columns = db
      .prepare(
        `
        SELECT c.*, 
               (SELECT COUNT(*) FROM tasks t WHERE t.column_id = c.id) as task_count
        FROM columns c
        WHERE c.board_id = ?
        ORDER BY c.position ASC
      `
      )
      .all(boardId) as ColumnWithTaskCount[];

    const response: BoardWithDetails = {
      ...board,
      owner,
      columns,
    };

    res.json({ board: response });
  } catch (error) {
    console.error("Get board error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.patch("/:boardId", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;
    const data = updateBoardSchema.parse(req.body);

    const board = db.prepare("SELECT * FROM boards WHERE id = ? AND owner_id = ?").get(boardId, userId) as
      | Board
      | undefined;

    if (!board) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found or you don't have permission to edit it",
      });
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description || null);
    }

    if (updates.length > 0) {
      updates.push("updated_at = ?");
      values.push(now);
      values.push(boardId);

      db.prepare(`UPDATE boards SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    }

    const updatedBoard = db.prepare("SELECT * FROM boards WHERE id = ?").get(boardId) as Board;

    res.json({ board: updatedBoard });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: formatZodErrors(error),
      });
    }
    console.error("Update board error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.delete("/:boardId", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;

    const board = db.prepare("SELECT * FROM boards WHERE id = ? AND owner_id = ?").get(boardId, userId) as
      | Board
      | undefined;

    if (!board) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found or you don't have permission to delete it",
      });
    }

    db.prepare("DELETE FROM boards WHERE id = ?").run(boardId);

    res.status(204).send();
  } catch (error) {
    console.error("Delete board error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.get("/:boardId/columns", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;

    if (!checkBoardAccess(userId, boardId)) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    const columns = db
      .prepare(
        `
        SELECT c.*, 
               (SELECT COUNT(*) FROM tasks t WHERE t.column_id = c.id) as task_count
        FROM columns c
        WHERE c.board_id = ?
        ORDER BY c.position ASC
      `
      )
      .all(boardId) as ColumnWithTaskCount[];

    res.json({ columns });
  } catch (error) {
    console.error("Get columns error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

router.post("/:boardId/columns", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;
    const { createColumnSchema } = require("../schemas");
    const data = createColumnSchema.parse(req.body);

    if (!checkBoardAccess(userId, boardId)) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    let position = data.position;
    if (position === undefined) {
      const maxPos = db
        .prepare("SELECT MAX(position) as max_pos FROM columns WHERE board_id = ?")
        .get(boardId) as { max_pos: number | null };
      position = (maxPos?.max_pos ?? -1) + 1;
    }

    const columnId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO columns (id, board_id, name, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(columnId, boardId, data.name, position, now, now);

    const column = db.prepare("SELECT * FROM columns WHERE id = ?").get(columnId);

    res.status(201).json({ column });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: formatZodErrors(error),
      });
    }
    console.error("Create column error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

// ============ Board Member Management ============

// Get board members
router.get("/:boardId/members", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;

    if (!checkBoardAccess(userId, boardId)) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    // Get owner
    const board = db.prepare("SELECT owner_id FROM boards WHERE id = ?").get(boardId) as { owner_id: string };
    const owner = db
      .prepare("SELECT id, email, name, is_admin, created_at FROM users WHERE id = ?")
      .get(board.owner_id) as UserPublic;

    // Get members
    const members = db
      .prepare(`
        SELECT bm.board_id, bm.user_id, bm.role,
               u.id, u.email, u.name, u.is_admin, u.created_at
        FROM board_members bm
        JOIN users u ON bm.user_id = u.id
        WHERE bm.board_id = ?
      `)
      .all(boardId) as Array<{
        board_id: string;
        user_id: string;
        role: string;
        id: string;
        email: string;
        name: string;
        is_admin: number;
        created_at: string;
      }>;

    const response: BoardMemberWithUser[] = [
      {
        board_id: boardId,
        user_id: owner.id,
        role: "owner" as const,
        user: owner,
      },
      ...members.map((m) => ({
        board_id: m.board_id,
        user_id: m.user_id,
        role: m.role as "admin" | "member",
        user: {
          id: m.id,
          email: m.email,
          name: m.name,
          is_admin: Boolean(m.is_admin),
          created_at: m.created_at,
        },
      })),
    ];

    res.json({ members: response });
  } catch (error) {
    console.error("Get board members error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

// Add board member
router.post("/:boardId/members", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;
    const data = addBoardMemberSchema.parse(req.body);

    // Only owner can add members
    if (!canManageMembers(userId, boardId)) {
      return sendError(res, 403, {
        code: "FORBIDDEN",
        message: "Only the board owner can manage members",
      });
    }

    // Find user by email
    const userToAdd = db
      .prepare("SELECT id, email, name, is_admin, created_at FROM users WHERE email = ?")
      .get(data.email) as { id: string; email: string; name: string; is_admin: number; created_at: string } | undefined;

    if (!userToAdd) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "User with this email not found",
      });
    }

    // Check if user is already the owner
    const board = db.prepare("SELECT owner_id FROM boards WHERE id = ?").get(boardId) as { owner_id: string };
    if (board.owner_id === userToAdd.id) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "User is already the owner of this board",
      });
    }

    // Check if already a member
    const existingMember = db
      .prepare("SELECT 1 FROM board_members WHERE board_id = ? AND user_id = ?")
      .get(boardId, userToAdd.id);

    if (existingMember) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "User is already a member of this board",
      });
    }

    // Add member
    db.prepare(
      "INSERT INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)"
    ).run(boardId, userToAdd.id, data.role);

    const member: BoardMemberWithUser = {
      board_id: boardId,
      user_id: userToAdd.id,
      role: data.role as "admin" | "member",
      user: {
        id: userToAdd.id,
        email: userToAdd.email,
        name: userToAdd.name,
        is_admin: Boolean(userToAdd.is_admin),
        created_at: userToAdd.created_at,
      },
    };

    res.status(201).json({ member });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: formatZodErrors(error),
      });
    }
    console.error("Add board member error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

// Update board member role
router.patch("/:boardId/members/:memberId", (req: AuthRequest, res: Response) => {
  try {
    const { boardId, memberId } = req.params;
    const userId = req.user!.id;
    const data = updateBoardMemberSchema.parse(req.body);

    // Only owner can update member roles
    if (!canManageMembers(userId, boardId)) {
      return sendError(res, 403, {
        code: "FORBIDDEN",
        message: "Only the board owner can manage members",
      });
    }

    // Can't change owner's role
    const board = db.prepare("SELECT owner_id FROM boards WHERE id = ?").get(boardId) as { owner_id: string };
    if (board.owner_id === memberId) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Cannot change the owner's role",
      });
    }

    // Check if member exists
    const existingMember = db
      .prepare("SELECT * FROM board_members WHERE board_id = ? AND user_id = ?")
      .get(boardId, memberId);

    if (!existingMember) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Member not found",
      });
    }

    // Update role
    db.prepare(
      "UPDATE board_members SET role = ? WHERE board_id = ? AND user_id = ?"
    ).run(data.role, boardId, memberId);

    const user = db
      .prepare("SELECT id, email, name, is_admin, created_at FROM users WHERE id = ?")
      .get(memberId) as { id: string; email: string; name: string; is_admin: number; created_at: string };

    const member: BoardMemberWithUser = {
      board_id: boardId,
      user_id: memberId,
      role: data.role as "admin" | "member",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: Boolean(user.is_admin),
        created_at: user.created_at,
      },
    };

    res.json({ member });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        details: formatZodErrors(error),
      });
    }
    console.error("Update board member error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

// Remove board member
router.delete("/:boardId/members/:memberId", (req: AuthRequest, res: Response) => {
  try {
    const { boardId, memberId } = req.params;
    const userId = req.user!.id;

    // Owner can remove anyone, members can remove themselves
    const isOwner = canManageMembers(userId, boardId);
    const isSelf = userId === memberId;

    if (!isOwner && !isSelf) {
      return sendError(res, 403, {
        code: "FORBIDDEN",
        message: "You don't have permission to remove this member",
      });
    }

    // Can't remove owner
    const board = db.prepare("SELECT owner_id FROM boards WHERE id = ?").get(boardId) as { owner_id: string };
    if (board.owner_id === memberId) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Cannot remove the board owner",
      });
    }

    const result = db
      .prepare("DELETE FROM board_members WHERE board_id = ? AND user_id = ?")
      .run(boardId, memberId);

    if (result.changes === 0) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Member not found",
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Remove board member error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

// Get user's role in a board
router.get("/:boardId/role", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;

    const role = getBoardRole(userId, boardId);

    if (!role) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found or you don't have access",
      });
    }

    res.json({ role });
  } catch (error) {
    console.error("Get board role error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

// Smart Search - search across all accessible boards
const searchSchema = z.object({
  q: z.string().min(1).max(200),
  boardId: z.string().uuid().optional(),
  type: z.enum(["all", "tasks", "comments"]).optional().default("all"),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

router.get("/search", (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const query = searchSchema.parse(req.query);
    const { q, boardId, type, limit } = query;
    
    const searchTerm = `%${q}%`;
    const results: {
      tasks: Array<{
        id: string;
        title: string;
        description: string | null;
        board_id: string;
        board_name: string;
        column_id: string;
        column_name: string;
        priority: string;
        status: string;
        match_type: "title" | "description" | "labels";
        match_context: string;
      }>;
      comments: Array<{
        id: string;
        content: string;
        task_id: string;
        task_title: string;
        board_id: string;
        board_name: string;
        author_name: string;
        created_at: string;
        match_context: string;
      }>;
    } = { tasks: [], comments: [] };

    // Get accessible board IDs
    let boardFilter = "";
    const boardParams: string[] = [];
    
    if (boardId) {
      // Check user has access to this specific board
      const hasAccess = db.prepare(`
        SELECT 1 FROM boards b
        LEFT JOIN board_members bm ON b.id = bm.board_id
        WHERE b.id = ? AND (b.owner_id = ? OR bm.user_id = ?)
        LIMIT 1
      `).get(boardId, userId, userId);
      
      if (!hasAccess) {
        return sendError(res, 404, {
          code: "NOT_FOUND",
          message: "Board not found or you don't have access",
        });
      }
      boardFilter = "AND b.id = ?";
      boardParams.push(boardId);
    }

    // Search tasks
    if (type === "all" || type === "tasks") {
      const taskResults = db.prepare(`
        SELECT 
          t.id,
          t.title,
          t.description,
          t.labels,
          t.priority,
          t.status,
          b.id as board_id,
          b.name as board_name,
          c.id as column_id,
          c.name as column_name,
          CASE
            WHEN t.title LIKE ? THEN 'title'
            WHEN t.description LIKE ? THEN 'description'
            ELSE 'labels'
          END as match_type
        FROM tasks t
        JOIN columns c ON t.column_id = c.id
        JOIN boards b ON c.board_id = b.id
        LEFT JOIN board_members bm ON b.id = bm.board_id
        WHERE (b.owner_id = ? OR bm.user_id = ?)
        ${boardFilter}
        AND (t.title LIKE ? OR t.description LIKE ? OR t.labels LIKE ?)
        GROUP BY t.id
        ORDER BY 
          CASE WHEN t.title LIKE ? THEN 0 ELSE 1 END,
          t.updated_at DESC
        LIMIT ?
      `).all(
        searchTerm, searchTerm, // for CASE
        userId, userId, // for access check
        ...boardParams,
        searchTerm, searchTerm, searchTerm, // for WHERE
        searchTerm, // for ORDER BY
        limit
      ) as Array<{
        id: string;
        title: string;
        description: string | null;
        labels: string | null;
        priority: string;
        status: string;
        board_id: string;
        board_name: string;
        column_id: string;
        column_name: string;
        match_type: string;
      }>;

      results.tasks = taskResults.map(task => {
        // Extract match context
        let matchContext = "";
        if (task.match_type === "title") {
          matchContext = task.title;
        } else if (task.match_type === "description" && task.description) {
          // Find the relevant snippet around the match
          const lowerDesc = task.description.toLowerCase();
          const lowerQ = q.toLowerCase();
          const matchIndex = lowerDesc.indexOf(lowerQ);
          if (matchIndex !== -1) {
            const start = Math.max(0, matchIndex - 30);
            const end = Math.min(task.description.length, matchIndex + q.length + 30);
            matchContext = (start > 0 ? "..." : "") + 
              task.description.slice(start, end) + 
              (end < task.description.length ? "..." : "");
          }
        } else if (task.labels) {
          matchContext = task.labels;
        }

        return {
          id: task.id,
          title: task.title,
          description: task.description,
          board_id: task.board_id,
          board_name: task.board_name,
          column_id: task.column_id,
          column_name: task.column_name,
          priority: task.priority,
          status: task.status,
          match_type: task.match_type as "title" | "description" | "labels",
          match_context: matchContext,
        };
      });
    }

    // Search comments
    if (type === "all" || type === "comments") {
      const commentResults = db.prepare(`
        SELECT 
          cm.id,
          cm.content,
          cm.created_at,
          t.id as task_id,
          t.title as task_title,
          b.id as board_id,
          b.name as board_name,
          u.name as author_name
        FROM comments cm
        JOIN tasks t ON cm.task_id = t.id
        JOIN columns c ON t.column_id = c.id
        JOIN boards b ON c.board_id = b.id
        JOIN users u ON cm.author_id = u.id
        LEFT JOIN board_members bm ON b.id = bm.board_id
        WHERE (b.owner_id = ? OR bm.user_id = ?)
        ${boardFilter}
        AND cm.content LIKE ?
        GROUP BY cm.id
        ORDER BY cm.created_at DESC
        LIMIT ?
      `).all(
        userId, userId,
        ...boardParams,
        searchTerm,
        limit
      ) as Array<{
        id: string;
        content: string;
        created_at: string;
        task_id: string;
        task_title: string;
        board_id: string;
        board_name: string;
        author_name: string;
      }>;

      results.comments = commentResults.map(comment => {
        // Extract match context
        const lowerContent = comment.content.toLowerCase();
        const lowerQ = q.toLowerCase();
        const matchIndex = lowerContent.indexOf(lowerQ);
        let matchContext = comment.content;
        
        if (comment.content.length > 100 && matchIndex !== -1) {
          const start = Math.max(0, matchIndex - 40);
          const end = Math.min(comment.content.length, matchIndex + q.length + 40);
          matchContext = (start > 0 ? "..." : "") + 
            comment.content.slice(start, end) + 
            (end < comment.content.length ? "..." : "");
        }

        return {
          id: comment.id,
          content: comment.content,
          task_id: comment.task_id,
          task_title: comment.task_title,
          board_id: comment.board_id,
          board_name: comment.board_name,
          author_name: comment.author_name,
          created_at: comment.created_at,
          match_context: matchContext,
        };
      });
    }

    res.json({
      query: q,
      results,
      total: results.tasks.length + results.comments.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "Invalid query parameters",
        details: formatZodErrors(error),
      });
    }
    console.error("Search error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

// ============ Column Heatmap (Friction Detector) ============

export interface ColumnHeatmapData {
  column_id: string;
  avg_time_in_column_hours: number;
  avg_comments_per_task: number;
  task_count: number;
  heat_score: number; // 0-100, higher = more friction
  heat_level: "cool" | "warm" | "hot";
  friction_reasons: string[];
}

router.get("/:boardId/heatmap", (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.id;

    if (!checkBoardAccess(userId, boardId)) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    // Get all columns for this board
    const columns = db
      .prepare("SELECT id, name FROM columns WHERE board_id = ? ORDER BY position ASC")
      .all(boardId) as Array<{ id: string; name: string }>;

    const now = new Date();
    const heatmapData: ColumnHeatmapData[] = [];

    for (const column of columns) {
      // Get tasks in this column with their age
      const tasks = db
        .prepare(`
          SELECT 
            t.id,
            t.created_at,
            t.updated_at,
            (SELECT COUNT(*) FROM comments c WHERE c.task_id = t.id) as comment_count
          FROM tasks t
          WHERE t.column_id = ? AND t.is_archived = 0
        `)
        .all(column.id) as Array<{
          id: string;
          created_at: string;
          updated_at: string;
          comment_count: number;
        }>;

      const taskCount = tasks.length;

      if (taskCount === 0) {
        heatmapData.push({
          column_id: column.id,
          avg_time_in_column_hours: 0,
          avg_comments_per_task: 0,
          task_count: 0,
          heat_score: 0,
          heat_level: "cool",
          friction_reasons: [],
        });
        continue;
      }

      // Calculate average time tasks have been in this column
      // Using updated_at as proxy for when task was moved to this column
      let totalHoursInColumn = 0;
      let totalComments = 0;

      for (const task of tasks) {
        const taskDate = new Date(task.updated_at);
        const hoursInColumn = (now.getTime() - taskDate.getTime()) / (1000 * 60 * 60);
        totalHoursInColumn += hoursInColumn;
        totalComments += task.comment_count;
      }

      const avgTimeInColumnHours = totalHoursInColumn / taskCount;
      const avgCommentsPerTask = totalComments / taskCount;

      // Calculate heat score (0-100)
      // Factors:
      // 1. Time in column: >48h starts getting warm, >168h (1 week) is hot
      // 2. Comments per task: >3 comments suggests discussion/confusion
      
      let timeScore = 0;
      if (avgTimeInColumnHours > 168) { // > 1 week
        timeScore = 50;
      } else if (avgTimeInColumnHours > 72) { // > 3 days
        timeScore = 35;
      } else if (avgTimeInColumnHours > 48) { // > 2 days
        timeScore = 20;
      } else if (avgTimeInColumnHours > 24) { // > 1 day
        timeScore = 10;
      }

      let commentScore = 0;
      if (avgCommentsPerTask > 5) {
        commentScore = 50;
      } else if (avgCommentsPerTask > 3) {
        commentScore = 35;
      } else if (avgCommentsPerTask > 2) {
        commentScore = 20;
      } else if (avgCommentsPerTask > 1) {
        commentScore = 10;
      }

      const heatScore = Math.min(100, timeScore + commentScore);

      // Determine heat level
      let heatLevel: "cool" | "warm" | "hot" = "cool";
      if (heatScore >= 60) {
        heatLevel = "hot";
      } else if (heatScore >= 30) {
        heatLevel = "warm";
      }

      // Generate friction reasons
      const frictionReasons: string[] = [];
      if (avgTimeInColumnHours > 168) {
        frictionReasons.push(`Tasks stuck for ${Math.round(avgTimeInColumnHours / 24)} days on avg`);
      } else if (avgTimeInColumnHours > 48) {
        frictionReasons.push(`Tasks waiting ${Math.round(avgTimeInColumnHours)} hours on avg`);
      }
      if (avgCommentsPerTask > 3) {
        frictionReasons.push(`High discussion (${avgCommentsPerTask.toFixed(1)} comments/task)`);
      } else if (avgCommentsPerTask > 1) {
        frictionReasons.push(`Active discussion (${avgCommentsPerTask.toFixed(1)} comments/task)`);
      }

      heatmapData.push({
        column_id: column.id,
        avg_time_in_column_hours: Math.round(avgTimeInColumnHours * 10) / 10,
        avg_comments_per_task: Math.round(avgCommentsPerTask * 10) / 10,
        task_count: taskCount,
        heat_score: heatScore,
        heat_level: heatLevel,
        friction_reasons: frictionReasons,
      });
    }

    res.json({ heatmap: heatmapData });
  } catch (error) {
    console.error("Get heatmap error:", error);
    return sendError(res, 500, {
      code: "INTERNAL",
      message: "An unexpected error occurred",
    });
  }
});

export default router;
