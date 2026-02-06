# Task Management Application

A modern task management application with a beautiful UI and powerful features.

## Features

- **Task Management**: Create, edit, delete, and move tasks between columns
- **Columns**: Manage columns (add, edit, delete) to organize your tasks
- **Comments**: Add comments to tasks for better communication
- **Search**: Search tasks by title or description
- **Pagination**: Navigate through tasks with pagination (5 tasks per page)
- **Drag and Drop**: Easily move tasks between columns using drag and drop
- **User Authentication**: Secure login and registration with JWT tokens
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query

### Backend
- Node.js
- Express
- TypeScript
- SQLite (in-memory storage)
- JWT authentication

## Getting Started

### Prerequisites

- Node.js (v20)
- pnpm (package manager)

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Build the application:

```bash
pnpm build
```

### Running the Application

1. Start the backend server:

```bash
cd apps/api
pnpm dev
```

2. Start the frontend development server:

```bash
cd apps/web
pnpm dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Running Tests

```bash
pnpm test
```

## Project Structure

```
.
├── apps/
│   ├── api/              # Backend API
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── routes/   # API endpoints
│   │   │   └── index.ts  # Server entry point
│   │   └── package.json  # API dependencies
│   └── web/              # Frontend application
│       ├── src/
│       │   ├── api/      # API client
│       │   ├── auth/     # Authentication context
│       │   ├── pages/    # Page components
│       │   └── ui/       # UI components
│       └── package.json  # Frontend dependencies
├── package.json          # Root package.json
└── README.md             # This file
```

## API Endpoints

### Authentication

- `POST /auth/login` - Login user
- `POST /auth/register` - Register new user

### Columns

- `GET /columns/:columnId` - Get column details
- `POST /columns` - Create new column
- `PUT /columns/:columnId` - Update column
- `DELETE /columns/:columnId` - Delete column

### Tasks

- `GET /tasks/columns/:columnId/tasks?page=1&limit=5&search=&sort=` - Get tasks for column
- `POST /tasks/columns/:columnId/tasks` - Create new task
- `PUT /tasks/:taskId` - Update task
- `DELETE /tasks/:taskId` - Delete task

### Comments

- `GET /comments/tasks/:taskId/comments` - Get task comments
- `POST /comments/tasks/:taskId/comments` - Create new comment

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Run tests
5. Create a pull request

## Tradeoffs and Limitations

### Tradeoffs

1. **In-Memory Storage**: The application uses in-memory storage for data persistence. This means all data is lost when the server is restarted. This was a tradeoff for simplicity and quick development.

2. **JWT Token Storage**: JWT tokens are stored in localStorage, which is vulnerable to XSS attacks. A more secure approach would be to use HTTP-only cookies.

3. **No Data Validation**: The application has minimal data validation. For example, there's no validation for task priorities or comment lengths.

4. **Limited Error Handling**: Error handling is basic. The application shows generic error messages, and there's no retry mechanism for failed API calls.

### Limitations

1. **Single User Workspace**: The application currently only supports a single user workspace. Multiple users can't collaborate on the same board.

2. **No Task Filters**: There are no filters for tasks (e.g., by priority, status, or due date).

3. **No Task Due Dates**: Tasks don't have due dates. This is a basic feature that's missing.

4. **No File Attachments**: Tasks don't support file attachments.

5. **No Real-Time Updates**: The application doesn't support real-time updates. Users have to refresh the page to see changes made by others.

6. **Limited Search**: The search functionality is basic. It only searches for tasks by title or description.

### Future Improvements

1. **Persistent Storage**: Replace in-memory storage with a database like PostgreSQL or MongoDB.

2. **Improved Security**: Use HTTP-only cookies for JWT token storage and add CSRF protection.

3. **Data Validation**: Add comprehensive data validation for all API endpoints.

4. **Enhanced Error Handling**: Improve error handling with more descriptive messages and retry mechanisms.

5. **Collaboration Features**: Add support for multiple users and real-time updates using WebSockets.

6. **Advanced Task Management**: Add task filters, due dates, and file attachments.

7. **Improved Search**: Add advanced search functionality with filters for task properties.

## License

This project is licensed under the MIT License.
