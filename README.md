# Take‑Home Starter — React + Node (Mid-level)

This repo is the **starter template** for the take‑home test “Team Boards” (tasks + comments).
It gives candidates a consistent baseline (scripts, linting, tests, CI), while leaving the actual feature work to them.

---

## What the candidate builds (core scope)

A small kanban-style board with **tasks** and **comments**, backed by a **Node API** (auth + REST) and a **React app**.

### Core requirements (must-have)
**Backend**
- Node + TypeScript (Express or Fastify)
- Local persistence (SQLite recommended)
- Validation (e.g., Zod/Joi)
- Auth (JWT or session cookie)
- Pagination + search on tasks
- Seed script creates demo board/columns/tasks/users
- Consistent error shape

**Frontend**
- React + TypeScript (Vite)
- Routing (any)
- Data fetching/caching (TanStack Query or equivalent)
- Auth screens (register/login)
- Board UI (columns + task cards)
- Create/edit task, move task between columns (DnD or dropdown)
- Task details with comments + add comment
- Loading/error/empty states
- Basic accessibility (labels, keyboard, contrast)

### Demo video (required)
A **3–5 minute** screen recording that shows:
1) Login/register flow  
2) Create a task + move it between columns  
3) Add a comment  
4) Tests running (`pnpm test`) or CI status  
5) One decision + tradeoff (30 seconds)

---

## Submission logistics (recommended)

### Preferred: Starter repo + PR (consistent diffs)
- Candidate works on a branch and opens a PR (or submits their repo link).
- Reviewers evaluate diff, CI, and local run.

> NOTE: If you prefer “repo + video” without PRs, that’s fine too — but you’ll lose the consistency of diff-based review.
> A good compromise is **PR + video**.

### IP / Fair play statement (include in the email)
- This is a simulated exercise; the company will not ship the submission.
- Candidate retains rights to their submission.
- No proprietary code from past employers.
- External libraries are fine; cite major references in README.

---

## How to run this starter

### Prereqs
- Node (see `.nvmrc`)
- pnpm (recommended)

### Install
```bash
pnpm install
```

### Dev (runs both apps)
```bash
pnpm dev
```

- API: http://localhost:4000 (health: `/health`)
- Web: http://localhost:5173

### Tests / Lint / Build
```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

---

## What’s included vs. what’s intentionally missing

✅ Included
- Monorepo workspace wiring
- API skeleton (Express) with health route and a consistent error helper
- React skeleton with TanStack Query wired
- Example tests (API + Web)
- ESLint/Prettier baseline
- GitHub Actions CI workflow

🚫 Intentionally missing (candidate implements)
- Auth (register/login, password hashing, JWT/cookies)
- DB schema + migrations + seed data
- All “Team Boards” endpoints and UI

---

## Evaluation rubric (100 pts)

**Architecture & Code Quality (25)**
- Structure, readability, separation of concerns, types

**Backend (25)**
- REST design, validation, auth, pagination/search, error handling

**Frontend (25)**
- UX flow end-to-end, data fetching/mutations, states, accessibility

**Testing & Tooling (15)**
- Meaningful tests, lint/typecheck/build passing

**Polish & Product Thinking (10)**
- README clarity, tradeoffs, small UX touches

---

## API contract expectations (guide)

Error shape:
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid payload",
    "details": [{ "path": "title", "issue": "Required" }]
  }
}
```

---

## Suggested endpoints (candidate implements)

Auth:
- POST `/auth/register`
- POST `/auth/login`

Boards:
- GET `/boards/:boardId`
- GET `/boards/:boardId/columns` (include tasks count)
- POST `/boards/:boardId/columns`

Columns:
- PATCH `/columns/:columnId`
- DELETE `/columns/:columnId`

Tasks:
- GET `/columns/:columnId/tasks?search=&page=&limit=&sort=createdAt|priority`
- POST `/columns/:columnId/tasks`
- PATCH `/tasks/:taskId` (partial updates + moving columns)
- DELETE `/tasks/:taskId`

Comments:
- GET `/tasks/:taskId/comments`
- POST `/tasks/:taskId/comments`

---

## Reviewer quick checklist (internal)
- `pnpm install && pnpm dev` works
- Auth works and blocks unauth’d access
- Create/edit/move task works
- Search + pagination works
- Comments view/add works
- CI is green; tests are meaningful
- README explains tradeoffs + known limitations


---

## 📝 Submission Related Information

---

### 🙏 Acknowledgment

Thank you for giving me the opportunity to showcase my skills through this assessment.

---

### ✨ Additional Features & Enhancements

While staying true to the core requirements, I've made some thoughtful additions:

1. **Role-Based Access Control (RBAC)** – Implemented `user` and `admin` roles for better access management. Admins can create/delete boards and manage columns, while users focus on tasks.

2. **Integrated Rules Section** – Added an info tooltip with board rules directly in the dashboard for better user guidance.

3. **Drizzle ORM** – Used Drizzle instead of raw SQLite for type-safe queries, better developer experience, automatic TypeScript inference, and cleaner migrations.

4. **API Endpoints** - I have written the end points same as mentioned in the suggestion endpoints for better review.

5. **Start and Installation** - For starting the assignment all instructions are same as per starter repository.

---

### 🛠️ Tech Stack

**Frontend:** React, TypeScript, TailwindCSS, TanStack Query, DND Kit, Axios, React Hook Form, React Router DOM, React Hot Toast, Lucide React, Context API

**Backend:** Node.js, Express, TypeScript, Drizzle ORM, Joi, JWT, bcrypt, SQLite

**Tools:** Postman, Git/GitHub, GitHub Actions (CI), ESLint, Prettier

---
---

## 🗄️ Database Schema
```typescript
users(id, email, passwordHash, name, role, createdAt)
boards(id, name, createdAt)
columns(id, boardId, name, createdAt)
tasks(id, columnId, title, description, priority, createdAt, updatedAt)
comments(id, taskId, userId, content, createdAt)
```

**Relationships:**
- `columns.boardId` → `boards.id` (cascade delete)
- `tasks.columnId` → `columns.id` (cascade delete)
- `comments.taskId` → `tasks.id` (cascade delete)
- `comments.userId` → `users.id`

**Enums:**
- `priority`: `low`, `medium`, `high`
- `role`: `user`, `admin`

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| **SYSTEM** ||||
| `GET` | `/` | API Root / Welcome Message |  Public |
| `GET` | `/health` | Health Check (Status OK + Timestamp) |  Public |
| **AUTH** ||||
| `POST` | `/auth/register` | Create a new user account (User or Admin role) |  Public |
| `POST` | `/auth/login` | Log in and receive HttpOnly Cookie |  Public |
| **BOARDS** ||||
| `GET` | `/boards` | Get list of all boards |  Authenticated |
| `GET` | `/boards/:id` | Get details of a specific board |  Authenticated |
| `GET` | `/boards/:id/columns` | Get columns for a board (includes task count) |  Authenticated |
| **TASKS** ||||
| `GET` | `/columns/:id/tasks` | Get tasks in a column (supports `?search=`, `?sort=`) |  Authenticated |
| `POST` | `/columns/:id/tasks` | Create a new task in a specific column |  Authenticated |
| `PATCH` | `/tasks/:id` | Update task details OR move to new column |  Authenticated |
| `DELETE` | `/tasks/:id` | Delete a task |  Authenticated |
| **COMMENTS** ||||
| `GET` | `/tasks/:id/comments` | View all comments for a task |  Authenticated |
| `POST` | `/tasks/:id/comments` | Add a comment to a task |  Authenticated |
| **ADMIN** ||||
| `POST` | `/admin/boards` | Create a new Board |  Admin Only |
| `DELETE` | `/admin/boards/:id` | Delete a Board |  Admin Only |
| `POST` | `/admin/columns` | Create a new Column |  Admin Only |
| `PATCH` | `/admin/columns/:id` | Rename a Column |  Admin Only |
| `DELETE` | `/admin/columns/:id` | Delete a Column |  Admin Only |

---

## 🧭 Frontend Routes

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | `AuthPage` |  Public | Login/Register page (redirects to `/board` if authenticated) |
| `/board` | `BoardDashboard` | Authenticated | Main kanban board with columns and tasks |
| `/:boardId/:columnId/task/:taskId` | `TaskPage` |  Authenticated | Task details page with comments |
| `/admin` | `AdminPage` |  Admin Only | Admin dashboard for board/column management |
| `*` | - | - | Redirects to `/` (Dashboard) |

**Route Guards:**
- `PublicRoute` – Accessible only when logged out
- `ProtectedRoute` – Requires authentication
- `AdminRoute` – Requires admin role

---

## 🧪 Testing

The project includes comprehensive test coverage for both frontend and backend using **Vitest** and **Testing Library**.

### Test Structure

**Frontend Tests** (`apps/web/tests/`)

| Test File | Description | Coverage |
|-----------|-------------|----------|
| `Header.test.tsx` | Header component rendering |  User info display, role badge, admin controls, logo |
| `App.test.tsx` | App integration & routing |  Login screen, register toggle, default routes |
| `utils.tsx` | Custom render utilities | Test helpers with QueryClient, Router, AuthProvider |

**Backend Tests** (`apps/api/tests/`)

| Test File | Description | Coverage |
|-----------|-------------|----------|
| `health.test.ts` | Health check endpoint |  API status verification |
| `auth.test.ts` | Authentication flow |  Register, login, duplicate email, wrong password |
| `seed.test.ts` | Seeded data integration |  Admin login, board fetching with auth cookies |

### Running Tests
```bash

pnpm test

pnpm test:watch

pnpm test:coverage
```

### Test Highlights

**Frontend:**
- Custom render utility wraps components with QueryClient, Router, and AuthProvider
- Mock AuthContext for isolated component testing
- Integration tests verify routing and authentication flows

**Backend:**
- Supertest for API endpoint testing
- Random email generation prevents test collisions
- Cookie-based auth verification
- Seeded data validation ensures migrations work correctly

### CI Pipeline

GitHub Actions runs automated tests on every push:
- ✅ Lint check (`pnpm lint`)
- ✅ Type check (`pnpm typecheck`)
- ✅ Unit & integration tests (`pnpm test`)
- ✅ Build verification (`pnpm build`)

---


## ⚖️ Design Decisions & Tradeoffs

### 1. **Drizzle ORM over Raw SQLite**
**Decision:** Used Drizzle ORM instead of raw SQL queries.

**Why:**
- Type-safe queries with automatic TypeScript inference
- Cleaner migrations and schema management
- Better developer experience with autocomplete
- Zero runtime overhead compared to other ORMs

**Tradeoff:** Slight learning curve, but the type safety and DX benefits outweigh it.

---

### 2. **HttpOnly Cookies for JWT**
**Decision:** Store JWT tokens in HttpOnly cookies instead of localStorage.

**Why:**
- Protection against XSS attacks (JavaScript cannot access the token)
- More secure for production applications
- Automatic cookie handling by browser

**Tradeoff:** Requires CORS configuration and cookie parsing middleware, but security is worth it.

---

### 3. **DND Kit over React Beautiful DnD**
**Decision:** Used DND Kit for drag-and-drop functionality.

**Why:**
- Modern, actively maintained (React Beautiful DnD is deprecated)
- Better TypeScript support
- Lightweight and performant

**Tradeoff:** Slightly more setup code, but future-proof and type-safe.

---

### 4. **Single Board Architecture**
**Decision:** Focused on a single-board experience rather than multi-board support.

**Why:**
- Simplified scope to meet core requirements
- Better UX for the demo (less navigation complexity)
- Seed script creates one well-structured board

**Tradeoff:** Not production-ready for multi-team scenarios, but extensible for future iterations.

---

### 5. **Role-Based Access Control (RBAC)**
**Decision:** Added admin/user roles beyond the core requirements.

**Why:**
- Demonstrates security best practices
- Showcases authorization logic
- Provides better separation of concerns (admins manage boards, users manage tasks)

**Tradeoff:** Added complexity, but improves real-world applicability.

---

## 🚧 Known Limitations

### 1. **No Board-Level User Permissions**
- Currently, all authenticated users have access to all boards
- No board-specific membership or access control (e.g., "User A can only access Board X")
- **Future improvement:** Implement `board_users` junction table to assign specific users to specific boards with roles (owner/member/viewer)

### 2. **No Real-Time Collaboration**
- Changes made by one user won't appear for others without a refresh
- **Future improvement:** WebSockets or polling for live updates

### 3. **Basic Search Implementation**
- Search only filters tasks by title/description (no fuzzy matching)
- **Future improvement:** Full-text search with ranking

### 4. **Pagination Only on Backend**
- Frontend loads all filtered tasks (pagination structure exists but not enforced in UI)
- **Future improvement:** Implement virtual scrolling or "Load More" button

### 5. **Limited Error Recovery**
- Network errors show toast notifications but don't retry automatically
- **Future improvement:** Add retry logic with exponential backoff

### 6. **No Image/File Attachments**
- Tasks and comments are text-only
- **Future improvement:** File upload with cloud storage (S3/Cloudinary)

### 7. **Basic Accessibility**
- Keyboard navigation works, but screen reader support could be improved
- **Future improvement:** ARIA labels, focus management, and screen reader testing

---