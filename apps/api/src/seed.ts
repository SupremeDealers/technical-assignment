import { getDb, closeDb } from "./db/index";
import { hashPassword } from "./auth/utils";

/**
 * Seed script to populate the database with demo data
 */
async function seed() {
  console.log("🌱 Starting database seed...\n");

  const db = getDb();

  try {
    // Check if data already exists
    const existingUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    
    if (existingUsers.count > 0) {
      console.log("⚠️  Database already contains data. Clearing existing data...\n");
      
      // Clear all data in correct order (respecting foreign keys)
      db.prepare("DELETE FROM comments").run();
      db.prepare("DELETE FROM tasks").run();
      db.prepare("DELETE FROM columns").run();
      db.prepare("DELETE FROM boards").run();
      db.prepare("DELETE FROM users").run();
      
      // Reset auto-increment sequences
      db.prepare("DELETE FROM sqlite_sequence").run();
      
      console.log("✓ Existing data cleared\n");
    }

    // Create demo users
    console.log("Creating users...");
    
    const users = [
      { email: "alice@example.com", password: "password123", name: "Alice Johnson" },
      { email: "bob@example.com", password: "password123", name: "Bob Smith" },
      { email: "charlie@example.com", password: "password123", name: "Charlie Davis" },
    ];

    const userIds: number[] = [];

    for (const user of users) {
      const passwordHash = await hashPassword(user.password);
      const result = db
        .prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)")
        .run(user.email, passwordHash, user.name);
      
      userIds.push(result.lastInsertRowid as number);
      console.log(`  ✓ Created user: ${user.name} (${user.email})`);
    }

    console.log("");

    // Create demo board
    console.log("Creating board...");
    
    const boardResult = db
      .prepare("INSERT INTO boards (title, description, created_by) VALUES (?, ?, ?)")
      .run(
        "Team Project Board",
        "Main project board for tracking team tasks and progress",
        userIds[0]
      );

    const boardId = boardResult.lastInsertRowid as number;
    console.log(`  ✓ Created board: Team Project Board\n`);

    // Create columns
    console.log("Creating columns...");
    
    const columns = [
      { title: "To Do", position: 0 },
      { title: "In Progress", position: 1 },
      { title: "Done", position: 2 },
    ];

    const columnIds: number[] = [];

    for (const column of columns) {
      const result = db
        .prepare("INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)")
        .run(boardId, column.title, column.position);
      
      columnIds.push(result.lastInsertRowid as number);
      console.log(`  ✓ Created column: ${column.title}`);
    }

    console.log("");

    // Create demo tasks
    console.log("Creating tasks...");
    
    const tasks = [
      // To Do column
      {
        columnId: columnIds[0],
        title: "Update API documentation",
        description: "Add examples and improve clarity in the API docs",
        priority: "medium",
        createdBy: userIds[0],
        assignedTo: userIds[1],
      },
      {
        columnId: columnIds[0],
        title: "Design new user dashboard",
        description: "Create mockups for the improved user dashboard with analytics",
        priority: "high",
        createdBy: userIds[0],
        assignedTo: userIds[2],
      },
      {
        columnId: columnIds[0],
        title: "Fix mobile responsive issues",
        description: "Address layout problems on smaller screen sizes",
        priority: "high",
        createdBy: userIds[1],
        assignedTo: null,
      },
      {
        columnId: columnIds[0],
        title: "Implement email notifications",
        description: "Set up email service for task assignment notifications",
        priority: "low",
        createdBy: userIds[2],
        assignedTo: userIds[0],
      },

      // In Progress column
      {
        columnId: columnIds[1],
        title: "Refactor authentication system",
        description: "Migrate from session-based to JWT tokens",
        priority: "high",
        createdBy: userIds[0],
        assignedTo: userIds[0],
      },
      {
        columnId: columnIds[1],
        title: "Add search functionality",
        description: "Implement full-text search across tasks and comments",
        priority: "medium",
        createdBy: userIds[1],
        assignedTo: userIds[1],
      },
      {
        columnId: columnIds[1],
        title: "Performance optimization",
        description: "Improve page load times and reduce bundle size",
        priority: "medium",
        createdBy: userIds[2],
        assignedTo: userIds[2],
      },

      // Done column
      {
        columnId: columnIds[2],
        title: "Set up CI/CD pipeline",
        description: "Configure GitHub Actions for automated testing and deployment",
        priority: "high",
        createdBy: userIds[0],
        assignedTo: userIds[0],
      },
      {
        columnId: columnIds[2],
        title: "Implement user authentication",
        description: "Add login and registration functionality",
        priority: "high",
        createdBy: userIds[0],
        assignedTo: userIds[1],
      },
      {
        columnId: columnIds[2],
        title: "Create database schema",
        description: "Design and implement SQLite database structure",
        priority: "high",
        createdBy: userIds[1],
        assignedTo: userIds[0],
      },
    ];

    const taskIds: number[] = [];

    for (const task of tasks) {
      const result = db
        .prepare(
          `INSERT INTO tasks (column_id, title, description, priority, created_by, assigned_to) 
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .run(
          task.columnId,
          task.title,
          task.description,
          task.priority,
          task.createdBy,
          task.assignedTo
        );
      
      taskIds.push(result.lastInsertRowid as number);
      
      const assignedToName = task.assignedTo 
        ? users.find((u, i) => userIds[i] === task.assignedTo)?.name 
        : "Unassigned";
      
      console.log(`  ✓ Created task: "${task.title}" (assigned to ${assignedToName})`);
    }

    console.log("");

    // Create demo comments
    console.log("Creating comments...");
    
    const comments = [
      // Comments on "Refactor authentication system" (task in progress)
      {
        taskId: taskIds[4],
        userId: userIds[0],
        content: "Started working on this. Planning to complete the JWT implementation by end of week.",
      },
      {
        taskId: taskIds[4],
        userId: userIds[1],
        content: "Great! Let me know if you need help with the middleware setup.",
      },
      {
        taskId: taskIds[4],
        userId: userIds[0],
        content: "Thanks! I might need a code review once I'm done.",
      },

      // Comments on "Set up CI/CD pipeline" (completed)
      {
        taskId: taskIds[7],
        userId: userIds[0],
        content: "CI/CD pipeline is now live! Tests run automatically on every push.",
      },
      {
        taskId: taskIds[7],
        userId: userIds[2],
        content: "Awesome work! This will save us so much time.",
      },

      // Comments on "Design new user dashboard"
      {
        taskId: taskIds[1],
        userId: userIds[2],
        content: "I'll start on the mockups tomorrow. Any specific metrics we want to highlight?",
      },
      {
        taskId: taskIds[1],
        userId: userIds[0],
        content: "Focus on task completion rates and team velocity. Also include a recent activity feed.",
      },

      // Comments on "Add search functionality"
      {
        taskId: taskIds[5],
        userId: userIds[1],
        content: "About 60% done. The basic search is working, now adding filters.",
      },
    ];

    for (const comment of comments) {
      db.prepare("INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)")
        .run(comment.taskId, comment.userId, comment.content);
      
      const userName = users[userIds.indexOf(comment.userId)]?.name;
      console.log(`  ✓ Created comment by ${userName}`);
    }

    console.log("");
    console.log("✅ Database seeded successfully!\n");
    console.log("Summary:");
    console.log(`  • ${users.length} users created`);
    console.log(`  • 1 board created`);
    console.log(`  • ${columns.length} columns created`);
    console.log(`  • ${tasks.length} tasks created`);
    console.log(`  • ${comments.length} comments created`);
    console.log("");
    console.log("You can now log in with:");
    console.log("  Email: alice@example.com");
    console.log("  Password: password123");
    console.log("");
    console.log("  Email: bob@example.com");
    console.log("  Password: password123");
    console.log("");
    console.log("  Email: charlie@example.com");
    console.log("  Password: password123");
    console.log("");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    closeDb();
  }
}

// Run seed
seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { seed };
