'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const userId = uuidv4();
    const boardId = uuidv4();
    const todoColumnId = uuidv4();
    const inProgressColumnId = uuidv4();
    const doneColumnId = uuidv4();

    // Create demo user
    await queryInterface.bulkInsert('users', [
      {
        id: userId,
        name: 'Demo User',
        email: 'demo@example.com',
        password: await bcrypt.hash('password123', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create demo board
    await queryInterface.bulkInsert('boards', [
      {
        id: boardId,
        name: 'My First Kanban Board',
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create demo columns
    await queryInterface.bulkInsert('columns', [
      {
        id: todoColumnId,
        title: 'To Do',
        order: 0,
        boardId: boardId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: inProgressColumnId,
        title: 'In Progress',
        order: 1,
        boardId: boardId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: doneColumnId,
        title: 'Done',
        order: 2,
        boardId: boardId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create demo tasks
    await queryInterface.bulkInsert('tasks', [
      {
        id: uuidv4(),
        title: 'Setup project repository',
        description: 'Initialize Git repository and setup basic project structure',
        order: 0,
        columnId: doneColumnId,
        boardId: boardId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: 'Design database schema',
        description: 'Create ERD and design database tables for the application',
        order: 1,
        columnId: doneColumnId,
        boardId: boardId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: 'Implement authentication',
        description: 'Build JWT-based authentication with bcrypt password hashing',
        order: 0,
        columnId: inProgressColumnId,
        boardId: boardId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: 'Create board management API',
        description: 'Implement CRUD operations for boards with ownership validation',
        order: 1,
        columnId: inProgressColumnId,
        boardId: boardId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: 'Write unit tests',
        description: 'Create comprehensive test suite using Jest and Supertest',
        order: 0,
        columnId: todoColumnId,
        boardId: boardId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: 'Setup CI/CD pipeline',
        description: 'Configure automated testing and deployment workflows',
        order: 1,
        columnId: todoColumnId,
        boardId: boardId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        title: 'Write API documentation',
        description: 'Document all endpoints with request/response examples',
        order: 2,
        columnId: todoColumnId,
        boardId: boardId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tasks', null, {});
    await queryInterface.bulkDelete('columns', null, {});
    await queryInterface.bulkDelete('boards', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};