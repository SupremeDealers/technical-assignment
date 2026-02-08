import "../env";
import db from './client';
import bcrypt from 'bcryptjs';

const seed = async () => {
  console.log('Seeding database...');
  
  // Clear existing data
  db.exec('DELETE FROM comments');
  db.exec('DELETE FROM tasks');
  db.exec('DELETE FROM columns');
  db.exec('DELETE FROM boards');
  db.exec('DELETE FROM users');

  const demoEmail = process.env.SEED_DEMO_EMAIL ?? 'demo@example.com';
  const demoPassword = process.env.SEED_DEMO_PASSWORD ?? 'Pwd@1234';
  const boardName = process.env.SEED_BOARD_NAME ?? 'Team Board';

  // Create User
  const hashedPassword = await bcrypt.hash(demoPassword, 10);
  const insertUser = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
  const userResult = insertUser.run(demoEmail, hashedPassword);
  const userId = userResult.lastInsertRowid;

  // Create Board
  const insertBoard = db.prepare('INSERT INTO boards (name, owner_id) VALUES (?, ?)');
  const boardResult = insertBoard.run(boardName, userId);
  const boardId = boardResult.lastInsertRowid;

  // Create Columns
  const insertColumn = db.prepare('INSERT INTO columns (board_id, title, "order") VALUES (?, ?, ?)');
  const col1 = insertColumn.run(boardId, 'To Do', 0).lastInsertRowid;
  const col2 = insertColumn.run(boardId, 'In Progress', 1).lastInsertRowid;
  const col3 = insertColumn.run(boardId, 'Done', 2).lastInsertRowid;

  // Create Tasks
  const insertTask = db.prepare('INSERT INTO tasks (column_id, title, description, priority, "order") VALUES (?, ?, ?, ?, ?)');
  insertTask.run(col1, 'Setup Repo', 'Initialize the monorepo structure', 'HIGH', 0);
  insertTask.run(col1, 'Implement Auth', 'JWT based auth', 'HIGH', 1);
  insertTask.run(col2, 'Design DB', 'Schema for tasks and comments', 'MEDIUM', 0);
  insertTask.run(col2, 'Create API', 'RESTful API for tasks', 'MEDIUM', 1);
  insertTask.run(col3, 'Deploy API', 'Host on Vercel', 'LOW', 0);
  
  console.log('Seeding complete!');
};

seed();