# TeamBoard - Technical Documentation

## Overview

TeamBoard is a modern Kanban-style task management application built with a React frontend and a Node.js API. It features real-time search, task CRUD operations, a commenting system, and persistent storage via SQLite.

---

## Tech Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Routing**: React Router DOM (v6)
- **Data Fetching/Caching**: TanStack Query (v5)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS with focus on Glassmorphism and modern Dark Mode aesthetics.

### Backend

- **Runtime**: Node.js
- **Framework**: Express (TypeScript)
- **Database**: SQLite (via `better-sqlite3`)
- **Validation**: Zod
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: BcryptJS

---

## Backend Architecture

### Database Schema

The SQLite database (`database.sqlite`) consists of three tables:

- `users`: Stores user identity and hashed passwords.
- `tasks`: Stores task details, current status, and timestamps.
- `comments`: Linked to tasks and users, storing discussion logs.

### Authentication Flow

1. **Register**: Creates a user, hashes the password via `bcrypt`, and returns a JWT.
2. **Login**: Verifies credentials and returns a JWT.
3. **Middleware**: An `authenticate` middleware protects routes by verifying the `Authorization: Bearer <token>` header.

### Validation & Error Handling

All incoming requests are validated using **Zod** schemas.

- **Consistent Error Shape**: All errors follow the structure:
  ```json
  {
    "error": {
      "code": "BAD_REQUEST | UNAUTHORIZED | NOT_FOUND | CONFLICT",
      "message": "Human readable message",
      "details": [] // Optional validation details
    }
  }
  ```

---

## Frontend Architecture

### State Management

- **Server State**: Managed by TanStack Query for automatic caching, revalidation (on mutations), and loading state management.
- **Auth State**: Managed through a `AuthContext` and `AuthProvider` that persists tokens to `localStorage`.

### UI Components

- **Board**: The main container managing search state and column layouts.
- **Column**: Filter-specific view showing tasks in Todo, In-Progress, or Done states.
- **TaskCard**: A premium interactive card showing a summary of the task.
- **TaskModal**: A comprehensive detail view for editing tasks and managing comments.
- **AuthScreen**: Dual-purpose screen for Login and Registration.

### Aesthetics & Accessibility

- **Design**: Implemented "Glassmorphism" using `backdrop-filter` and semi-transparent layers.
- **User Experience**: Debounced search for smooth real-time filtering.
- **Accessibility**: Semantic HTML, high contrast colors (`#f8fafc` on `#0f172a`), and standard focus rings for keyboard navigation.

---

## API Reference

### Authentication

- `POST /auth/register`: Create a new user.
- `POST /auth/login`: Authenticate and get a token.
- `GET /auth/me`: Get current authenticated user info.

### Tasks

- `GET /tasks?search=...&page=...&limit=...`: List tasks with search and pagination.
- `POST /tasks`: Create a new task.
- `PATCH /tasks/:id`: Update task title, description, or status.
- `DELETE /tasks/:id`: Delete a task and its associated comments.

### Comments

- `GET /tasks/:id/comments`: Fetch all comments for a specific task.
- `POST /tasks/:id/comments`: Add a comment to a task.

---

## Getting Started

### 1. Seeding the Database

To populate the database with demo tasks, users, and comments:

```bash
cd apps/api
npm run seed
```

**Demo User**: `alice` / `password123`

### 2. Running the Application

Ensure both the API and Web applications are running:

- **API**: `npm run dev` in `apps/api` (Starts on port 4000)
- **Web**: `npm run dev` in `apps/web` (Starts on port 5173)
