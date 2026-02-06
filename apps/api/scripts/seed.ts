import { db } from '../src/db';
import { users, boards, columns, tasks, comments } from '../src/db/schema';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Starting seed...');

  //Clean the database (Delete in order of relationships)
  await db.delete(comments);
  await db.delete(tasks);
  await db.delete(columns);
  await db.delete(boards);
  await db.delete(users);

  console.log('Database cleared.');

  //Create a Demo User
  const passwordHash = await bcrypt.hash('password123', 10);
  const [user] = await db.insert(users).values({
    email: 'demo@test.com',
    name: 'Demo User',
    passwordHash,
  }).returning();

  console.log(`👤 Created user: ${user.email}`);

  //Create a Board
  const [board] = await db.insert(boards).values({
    name: 'Product Roadmap',
  }).returning();

  //Create Columns
  const [colTodo] = await db.insert(columns).values({
    boardId: board.id,
    name: 'To Do',
    position: 0,
  }).returning();

  const [colProgress] = await db.insert(columns).values({
    boardId: board.id,
    name: 'In Progress',
    position: 1,
  }).returning();

  const [colDone] = await db.insert(columns).values({
    boardId: board.id,
    name: 'Done',
    position: 2,
  }).returning();

  //Create Tasks
  await db.insert(tasks).values([
    {
      columnId: colTodo.id,
      title: 'Setup Repo',
      description: 'Initialize monorepo with Turborepo',
      priority: 'high',
      position: 0,
    },
    {
      columnId: colTodo.id,
      title: 'Design DB Schema',
      description: 'Define users, boards, and tasks tables',
      priority: 'medium',
      position: 1,
    },
    {
      columnId: colProgress.id,
      title: 'Build Auth API',
      description: 'Implement JWT login and register',
      priority: 'high',
      position: 0,
    },
    {
      columnId: colDone.id,
      title: 'Read Assignment',
      description: 'Check requirements carefully',
      priority: 'low',
      position: 0,
    },
  ]);

  console.log('Seeding complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});