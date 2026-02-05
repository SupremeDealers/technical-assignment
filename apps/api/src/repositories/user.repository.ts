import { getDbInstance } from "../db/index";
import type { User } from "../types/entities";

export function findByEmail(email: string): (User & { passwordHash: string }) | null {
  const db = getDbInstance();
  const row = db
    .prepare("SELECT id, email, name, password_hash as passwordHash FROM users WHERE email = ?")
    .get(email) as (User & { passwordHash: string }) | undefined;
  return row ?? null;
}

export function findById(id: number): User | null {
  const db = getDbInstance();
  const row = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(id) as User | undefined;
  return row ?? null;
}

export function create(data: { email: string; passwordHash: string; name: string }): User {
  const db = getDbInstance();
  const result = db
    .prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)")
    .run(data.email, data.passwordHash, data.name);
  const user = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(result.lastInsertRowid) as User;
  return user;
}
