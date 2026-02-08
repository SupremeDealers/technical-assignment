import { Request, Response } from "express";
import db from "../../db";
import { sendError } from "../../errors";

export function getBoard(req: Request, res: Response) {
  const id = Number(req.params.id);
  const board = db.prepare("SELECT id, name FROM boards WHERE id = ?").get(id);
  if (!board)
    return sendError(res, 404, {
      code: "NOT_FOUND",
      message: "Board not found",
    });
  res.json(board);
}

export function getColumns(req: Request, res: Response) {
  const id = Number(req.params.id);
  const cols = db
    .prepare(
      'SELECT id, name, "order" FROM columns WHERE board_id = ? ORDER BY "order"',
    )
    .all(id);

  //add tasks count
  const withCounts = cols.map((c: any) => {
    const countResult = db
      .prepare("SELECT COUNT(*) as c FROM tasks WHERE column_id = ?")
      .get(c.id) as { c: number };
    const count = countResult.c;
    return { ...c, tasksCount: count };
  });
  res.json(withCounts);
}
