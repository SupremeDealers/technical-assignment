
import bcrypt from 'bcrypt';
import { prisma } from "../src/utilities/db"


async function main() {
    console.log('🌱 Starting seed...');

    // Clean existing data
    await prisma.comment.deleteMany();
    await prisma.task.deleteMany();
    await prisma.column.deleteMany();
    await prisma.board.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Cleaned existing data');

    // Create demo users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await prisma.user.create({
        data: {
            name: 'Alice Johnson',
            email: 'alice@example.com',
            password: hashedPassword,
        },
    });

    const _user2 = await prisma.user.create({
        data: {
            name: 'Bob Smith',
            email: 'bob@example.com',
            password: hashedPassword,
        },
    });

    const _user3 = await prisma.user.create({
        data: {
            name: 'Charlie Davis',
            email: 'charlie@example.com',
            password: hashedPassword,
        },
    });

    console.log('✅ Created 3 users (password: password123)');

    // Create demo board
    const board = await prisma.board.create({
        data: {
            name: 'Team Projects',
            userId: user1.id,
        },
    });

    console.log('✅ Created board: Team Projects');

    // Create columns
    const todoColumn = await prisma.column.create({
        data: {
            boardId: board.id,
            name: 'To Do',
            position: 0,
        },
    });

    const inProgressColumn = await prisma.column.create({
        data: {
            boardId: board.id,
            name: 'In Progress',
            position: 1,
        },
    });

    const doneColumn = await prisma.column.create({
        data: {
            boardId: board.id,
            name: 'Done',
            position: 2,
        },
    });

    console.log('✅ Created 3 columns: To Do, In Progress, Done');

    // Create tasks in To Do column
    const task1 = await prisma.task.create({
        data: {
            columnId: todoColumn.id,
            title: 'Design new landing page',
            description: 'Create mockups and wireframes for the new landing page redesign',
            priority: 'high',
            position: 0,
        },
    });

    const _task2 = await prisma.task.create({
        data: {
            columnId: todoColumn.id,
            title: 'Update API documentation',
            description: 'Add documentation for the new authentication endpoints',
            priority: 'medium',
            position: 1,
        },
    });

    const task3 = await prisma.task.create({
        data: {
            columnId: todoColumn.id,
            title: 'Fix mobile responsive issues',
            description: 'Address layout problems on mobile devices',
            priority: 'high',
            position: 2,
        },
    });

    // Create tasks in In Progress column
    const task4 = await prisma.task.create({
        data: {
            columnId: inProgressColumn.id,
            title: 'Implement user authentication',
            description: 'Add JWT-based authentication with login and register endpoints',
            priority: 'high',
            position: 0,
        },
    });

    const task5 = await prisma.task.create({
        data: {
            columnId: inProgressColumn.id,
            title: 'Set up CI/CD pipeline',
            description: 'Configure GitHub Actions for automated testing and deployment',
            priority: 'medium',
            position: 1,
        },
    });

    const task6 = await prisma.task.create({
        data: {
            columnId: inProgressColumn.id,
            title: 'Write unit tests',
            description: 'Add test coverage for core business logic',
            priority: 'low',
            position: 2,
        },
    });

    // Create tasks in Done column
    const task7 = await prisma.task.create({
        data: {
            columnId: doneColumn.id,
            title: 'Set up database schema',
            description: 'Design and implement Prisma schema for the application',
            priority: 'high',
            position: 0,
        },
    });

    const _task8 = await prisma.task.create({
        data: {
            columnId: doneColumn.id,
            title: 'Initialize project structure',
            description: 'Set up monorepo with API and web apps',
            priority: 'high',
            position: 1,
        },
    });

    const _task9 = await prisma.task.create({
        data: {
            columnId: doneColumn.id,
            title: 'Configure ESLint and Prettier',
            description: 'Add code quality tools and formatting rules',
            priority: 'low',
            position: 2,
        },
    });

    const _task10 = await prisma.task.create({
        data: {
            columnId: doneColumn.id,
            title: 'Add health check endpoint',
            description: 'Implement /health endpoint for monitoring',
            priority: 'low',
            position: 3,
        },
    });

    console.log('✅ Created 10 tasks across all columns');

    // Create comments
    await prisma.comment.create({
        data: {
            taskId: task1.id,
            userId: user1.id,
            content: 'I can help with the design mockups. Should we use Figma?',
        },
    });

    await prisma.comment.create({
        data: {
            taskId: task1.id,
            userId: user1.id,
            content: 'Yes, Figma works great! I\'ll share the workspace link.',
        },
    });

    await prisma.comment.create({
        data: {
            taskId: task4.id,
            userId: user1.id,
            content: 'Authentication is almost done. Just need to add refresh token logic.',
        },
    });

    await prisma.comment.create({
        data: {
            taskId: task4.id,
            userId: user1.id,
            content: 'Great progress! Make sure to add rate limiting too.',
        },
    });

    await prisma.comment.create({
        data: {
            taskId: task5.id,
            userId: user1.id,
            content: 'CI pipeline is configured. Running first test now.',
        },
    });

    await prisma.comment.create({
        data: {
            taskId: task7.id,
            userId: user1.id,
            content: 'Schema looks good! All migrations ran successfully.',
        },
    });

    await prisma.comment.create({
        data: {
            taskId: task3.id,
            userId: user1.id,
            content: 'Found the issue - it\'s related to flexbox on iOS Safari.',
        },
    });

    await prisma.comment.create({
        data: {
            taskId: task6.id,
            userId: user1.id,
            content: 'Added tests for auth module. Coverage is at 85% now.',
        },
    });

    console.log('✅ Created 8 comments');

    // Create second board for Alice - Marketing Campaign
    const marketingBoard = await prisma.board.create({
        data: {
            name: 'Marketing Campaign',
            userId: user1.id,
        },
    });

    const marketingTodo = await prisma.column.create({
        data: {
            boardId: marketingBoard.id,
            name: 'Backlog',
            position: 0,
        },
    });

    const marketingInProgress = await prisma.column.create({
        data: {
            boardId: marketingBoard.id,
            name: 'In Progress',
            position: 1,
        },
    });

    const marketingDone = await prisma.column.create({
        data: {
            boardId: marketingBoard.id,
            name: 'Completed',
            position: 2,
        },
    });

    await prisma.task.create({
        data: {
            columnId: marketingTodo.id,
            title: 'Create social media content calendar',
            description: 'Plan posts for Q1 2026 across all platforms',
            priority: 'high',
            position: 0,
        },
    });

    await prisma.task.create({
        data: {
            columnId: marketingTodo.id,
            title: 'Design email templates',
            description: 'Create responsive email templates for newsletters',
            priority: 'medium',
            position: 1,
        },
    });

    await prisma.task.create({
        data: {
            columnId: marketingInProgress.id,
            title: 'Launch Instagram campaign',
            description: 'Run promotional campaign for new product launch',
            priority: 'high',
            position: 0,
        },
    });

    await prisma.task.create({
        data: {
            columnId: marketingDone.id,
            title: 'Update brand guidelines',
            description: 'Refresh brand colors and typography guidelines',
            priority: 'low',
            position: 0,
        },
    });

    console.log('✅ Created board: Marketing Campaign with 4 tasks');

    // Create third board for Alice - Product Development
    const productBoard = await prisma.board.create({
        data: {
            name: 'Product Development',
            userId: user1.id,
        },
    });

    const productBacklog = await prisma.column.create({
        data: {
            boardId: productBoard.id,
            name: 'Ideas',
            position: 0,
        },
    });

    const productDev = await prisma.column.create({
        data: {
            boardId: productBoard.id,
            name: 'Development',
            position: 1,
        },
    });

    const productReview = await prisma.column.create({
        data: {
            boardId: productBoard.id,
            name: 'Review',
            position: 2,
        },
    });

    const productLaunched = await prisma.column.create({
        data: {
            boardId: productBoard.id,
            name: 'Shipped',
            position: 3,
        },
    });

    await prisma.task.create({
        data: {
            columnId: productBacklog.id,
            title: 'User profile customization',
            description: 'Allow users to customize their profile with themes and avatars',
            priority: 'medium',
            position: 0,
        },
    });

    await prisma.task.create({
        data: {
            columnId: productBacklog.id,
            title: 'Dark mode toggle',
            description: 'Add system-wide dark mode support',
            priority: 'low',
            position: 1,
        },
    });

    await prisma.task.create({
        data: {
            columnId: productDev.id,
            title: 'Real-time notifications',
            description: 'Implement WebSocket-based notification system',
            priority: 'high',
            position: 0,
        },
    });

    await prisma.task.create({
        data: {
            columnId: productDev.id,
            title: 'Mobile app beta',
            description: 'Develop React Native mobile app prototype',
            priority: 'high',
            position: 1,
        },
    });

    await prisma.task.create({
        data: {
            columnId: productReview.id,
            title: 'Advanced search filters',
            description: 'Add filtering by date, priority, and assignee',
            priority: 'medium',
            position: 0,
        },
    });

    await prisma.task.create({
        data: {
            columnId: productLaunched.id,
            title: 'Drag-and-drop interface',
            description: 'Intuitive drag-and-drop for tasks and columns',
            priority: 'high',
            position: 0,
        },
    });

    console.log('✅ Created board: Product Development with 6 tasks');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: 3`);
    console.log(`   - Boards: 3 (Team Projects, Marketing Campaign, Product Development)`);
    console.log(`   - Columns: 10`);
    console.log(`   - Tasks: 20`);
    console.log(`   - Comments: 8`);
    console.log('\n🔑 Login credentials:');
    console.log('   - alice@example.com / password123');
    console.log('   - bob@example.com / password123');
    console.log('   - charlie@example.com / password123');
    console.log(`\n📋 Board ID: ${board.id}`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
