# Team Boards — Implementation Guide

## Overview

This document outlines the architecture, key decisions, and implementation details of the Team Boards kanban style application.

## Architecture

### Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- SQLite for persistence
- Prisma ORM for database access
- JWT for authentication
- bcryptjs for password hashing

**Frontend:**
- React 18 + TypeScript
- Vite for bundling
- TanStack Query for data fetching and caching
- Native drag-and-drop for task movement

### Database Schema

**Core Models:**
- **User**: Stores email, hashed password, and name
- **Board**: Belongs to a user; contains columns and tasks
- **Column**: Belongs to a board; contains tasks (position-ordered)
- **Task**: Belongs to a board and column; can have comments
- **Comment**: Belongs to a task and user

**Key Design Decisions:**
- Position fields on Column/Task for drag-and-drop ordering
- Cascade deletes on board deletion (cleanup all child records)
- Indexes on foreign keys for query performance
- User scoping ensures data isolation

## Backend Implementation

### Authentication Flow

1. **Register** (`POST /auth/register`)
   - Validates email uniqueness and password strength (min 6 chars)
   - Hashes password with bcryptjs (10 salt rounds)
   - Returns user and JWT token (7-day expiry)

2. **Login** (`POST /auth/login`)
   - Verifies email exists and password matches
   - Returns user and JWT token

3. **Auth Middleware** (`GET /auth/me`)
   - Extracts JWT from Authorization header
   - Validates token and attaches userId to request
   - Protects all board/task endpoints

### API Endpoints

**Auth:**
- `POST /auth/register` — Create account
- `POST /auth/login` — Sign in
- `GET /auth/me` — Get current user (requires auth)

**Boards:**
- `GET /boards` — List all user boards (includes columns/tasks)
- `GET /boards/:boardId` — Get full board with columns, tasks, comments
- `POST /boards` — Create new board
- `PUT /boards/:boardId` — Update board title
- `DELETE /boards/:boardId` — Delete board and all children

**Columns:**
- `POST /boards/:boardId/columns` — Create column
- `PUT /columns/:columnId` — Update column title/position
- `DELETE /columns/:columnId` — Delete column

**Tasks:**
- `POST /boards/:boardId/tasks` — Create task in column
- `GET /boards/:boardId/tasks` — List tasks (supports search, pagination)
- `GET /tasks/:taskId` — Get task with comments
- `PUT /tasks/:taskId` — Update task (title, description, columnId, position)
- `DELETE /tasks/:taskId` — Delete task

**Comments:**
- `POST /tasks/:taskId/comments` — Add comment
- `GET /tasks/:taskId/comments` — List comments
- `PUT /comments/:commentId` — Edit comment
- `DELETE /comments/:commentId` — Delete comment

### Error Handling

All errors follow a consistent shape:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Readable message",
    "details": {}
  }
}
```

Error codes: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL`

### Validation & Security

- Email format validation on register/login
- Password min-length (6 chars)
- User isolation: all board/task queries filtered by userId
- No sensitive data in error messages
- CORS enabled with credentials support

### Database Initialization

**Seed Script** (`pnpm db:seed`):
- Clears all tables
- Creates demo user: `demo@example.com` / `password123`
- Creates 1 board with 3 columns
- Creates 3 sample tasks with comments

**Migration** (`pnpm db:migrate`):
- Runs Prisma migrations
- Auto-creates SQLite schema

## Frontend Implementation

### State Management

**Auth Context:**
- Manages user and token state
- Persists token to localStorage
- Auto-validates token on app load
- Provides login/register/logout functions

**React Query:**
- Caches board/task data
- Manages loading/error states
- Automatic refetching on mutations

### Component Structure

```
App
├── LoginPage / RegisterPage
└── BoardListPage
    ├── Create board form
    ├── Board cards
    └── BoardView
        ├── Column
        │   ├── Task cards (draggable)
        │   └── Add task form
        ├── Add column form
        └── TaskDetailModal
            ├── Edit title/description
            └── Comments section
```

### Key Features

**Authentication:**
- Register/login pages with validation
- Token stored in localStorage
- Session persists on page reload
- Logout clears token and state

**Kanban Board:**
- Drag-and-drop tasks between columns
- Real-time position updates to API
- Optimistic UI updates (shows change immediately)

**Task Management:**
- Create/edit/delete tasks
- Move between columns by dragging or detail modal
- Search and pagination (basic)

**Comments:**
- View all task comments
- Add new comments

**UI/UX:**
- Loading states on all async operations
- Error messages on failures
- Empty states when no data
- Responsive layout (flexbox)
- Focus on simplicity and clarity

## Trade-offs & Decisions

### Why Prisma + SQLite?

**Pros:**
- Type-safe schema and queries
- Auto-generated migrations
- Simple for local development
- No external DB setup required

**Cons:**
- SQLite not ideal for concurrent writes
- For production, would migrate to PostgreSQL

**Decision:** Perfect for take-home test requiring no external services.

### Why localStorage for Auth?

**Pros:**
- Simple, no session backend needed
- Works for this scope

**Cons:**
- Vulnerable to XSS
- Can't revoke tokens easily

**Decision:** Acceptable for demo. Production would use:
- HTTP-only cookies (harder to steal)
- Short-lived access tokens + refresh tokens
- Session revocation list

### Why Drag-and-Drop over Dropdown?

**Pros:**
- Better UX for kanban use case
- Familiar interaction pattern
- More visual feedback

**Cons:**
- More complex code
- Less accessible (keyboard users)

**Decision:** Native HTML5 drag-drop is simple enough; added keyboard fallback in form inputs.

### Why React Query?

**Pros:**
- Automatic caching and refetching
- Less state boilerplate
- Background sync

**Cons:**
- Extra dependency

**Decision:** Standard for React data fetching; overkill for very small app but good practice.

### Frontend Styling

**Decision:** Inline styles (no CSS framework)

**Rationale:**
- No build complexity
- Easy to see all styles inline
- Reasonable for demo scope
- Can be refactored to Tailwind/CSS Modules later

## Testing Strategy

### Backend Tests

**Auth tests** (`apps/api/test/auth.test.ts`):
- Register success and error cases
- Login with correct/incorrect password
- Token validation on `/auth/me`

**Board tests** (`apps/api/test/board.test.ts`):
- Create/read/update/delete boards
- Auth and ownership validation
- Not found and validation errors

**Coverage:**
- Happy paths (successful operations)
- Error cases (invalid input, auth, not found)
- Auth protection

**Run:** `pnpm test`

### Frontend Tests

**Placeholder:** Smoke test in `apps/web/test/smoke.test.tsx`

**Future:** Component tests for:
- LoginPage form validation
- Board list rendering
- Column drag-and-drop
- Comment addition

## Running the Application

### Development

```bash
pnpm install

# Initialize database
pnpm -C apps/api db:migrate
pnpm -C apps/api db:seed

# Run both apps
pnpm dev

# API: http://localhost:4000
# Web: http://localhost:5173
```

### Demo Credentials

- Email: `demo@example.com`
- Password: `password123`

### Testing

```bash
pnpm test      # Run all tests
pnpm lint      # Check linting
pnpm typecheck # Check TypeScript
pnpm build     # Build for production
```

## Known Limitations

1. **Concurrent Task Updates**: SQLite doesn't handle high concurrency well. For production, would use PostgreSQL with transactions.

2. **Drag-and-Drop Accessibility**: Native HTML5 drag-and-drop has limited keyboard support. Would add button-based movement as fallback.

3. **Real-time Sync**: No WebSocket. Multiple users see stale data if another user makes changes. Would add Socket.io/SvelteKit for live updates.

4. **Search**: Simple substring matching. Production would use full-text search (Postgres, Elasticsearch, etc.).

5. **Permissions**: No edit/delete permissions beyond board ownership. All board members have full access.

6. **Error Boundaries**: Frontend has no error boundary. If a component crashes, whole app breaks.

## Future Enhancements

1. User invitations and board sharing
2. Task priorities and due dates
3. Activity log / audit trail
4. WebSocket for real-time updates
5. Mobile app (React Native)
6. Dark mode
7. Undo/redo
8. Bulk task operations
9. Custom fields and labels
10. Webhook integrations

## References

- [Prisma Docs](https://www.prisma.io/docs/)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Query](https://tanstack.com/query/latest)
- [HTML5 Drag and Drop](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
