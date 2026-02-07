import { db } from '../src/db';
import { users, boards, columns, tasks, comments } from '../src/db/schema';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Starting seed...');

  //Clean the database (Delete in reverse order of relationships)
  console.log('Clearing old data...');
  await db.delete(comments);
  await db.delete(tasks);
  await db.delete(columns);
  await db.delete(boards);
  await db.delete(users);

  //Create Users (Same Password)
  const passwordHash = await bcrypt.hash('password123', 10);

  const [admin] = await db.insert(users).values({
    email: 'admin@demo.com',
    name: 'Admin User',
    passwordHash,
    role: 'admin',
  }).returning();

  const [user] = await db.insert(users).values({
    email: 'user@demo.com',
    name: 'Normal User',
    passwordHash,
    role: 'user',
  }).returning();

  console.log(`Created Admin: ${admin.email} / password123`);
  console.log(`Created User: ${user.email} / password123`);

  //Create Board
  const [board] = await db.insert(boards).values({
    name: 'Engineering Sprint',
  }).returning();

  console.log(`Created Board: ${board.name}`);

  // Create Columns
  // We create them in order. Since we sort by CreatedAt, 'To Do' will be first.
  const [colTodo] = await db.insert(columns).values({ boardId: board.id, name: 'To Do' }).returning();
  const [colProgress] = await db.insert(columns).values({ boardId: board.id, name: 'In Progress' }).returning();
  const [colDone] = await db.insert(columns).values({ boardId: board.id, name: 'Done' }).returning();

  //Create Tasks
  console.log('Generating Tasks...');

  const tasksToInsert: any[] = [];

  //Generate 22 "To Do" tasks (To test Pagination - limit is usually 20)
  for (let i = 1; i <= 22; i++) {
    tasksToInsert.push({
      columnId: colTodo.id,
      title: `Task ${i}: Feature implementation`,
      description: `This is a generated task description for #${i}`,
      priority: i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low',
    });
  }

  // Generate "In Progress" tasks
  for (let i = 1; i <= 8; i++) {
    tasksToInsert.push({
      columnId: colProgress.id,
      title: `In Progress Task ${i}`,
      description: `Work in progress task #${i}`,
      priority: i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low',
    });
  }

  // Generate "Done" tasks
  for (let i = 1; i <= 8; i++) {
    tasksToInsert.push({
      columnId: colDone.id,
      title: `Done Task ${i}`,
      description: `Completed task #${i}`,
      priority: i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low',
    });
  }

  const createdTasks = await db.insert(tasks).values(tasksToInsert).returning();
  console.log(`Created ${createdTasks.length} Tasks`);

  //Create Comments (7 Comments Total)
  // We attach them to the first few tasks in "In Progress"
  const targetTask = createdTasks.find(t => t.title === 'Fix Auth Bug');

  if (targetTask) {
    await db.insert(comments).values([
      { taskId: targetTask.id, userId: admin.id, content: 'I looked into this, it seems to be a cookie issue.' },
      { taskId: targetTask.id, userId: user.id, content: 'Can you reproduce it on Chrome?' },
      { taskId: targetTask.id, userId: admin.id, content: 'No, Chrome is fine. Only Safari.' },
      { taskId: targetTask.id, userId: user.id, content: 'Okay, I will check the SameSite settings.' },
      { taskId: targetTask.id, userId: user.id, content: 'Found it! PR is up.' },
      { taskId: targetTask.id, userId: admin.id, content: 'Great job, approving now.' },
      { taskId: targetTask.id, userId: admin.id, content: 'Deployment started.' },
    ]);
    console.log(`Added 7 comments to task: "${targetTask.title}"`);
  }

  console.log('Seeding complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});