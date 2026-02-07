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

### 1) Install deps (repo root)
```bash
pnpm install
```

### 2) Create env files

Create `apps/api/.env`:
```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret"
```

Create `apps/web/.env`:
```bash
VITE_API_URL="http://localhost:4000"
```

### 3) Initialize Prisma (API database)
From repo root:
```bash
# generate Prisma client
pnpm --filter @takehome/api prisma generate

# create/update SQLite schema
pnpm --filter @takehome/api db:push
```

### 4) Seed demo data (optional but recommended)
```bash
pnpm --filter @takehome/api db:seed
```

### 5) Run dev servers (both apps)
```bash
pnpm dev
```

- API: http://localhost:4000 (health: `/health`)
- Web: http://localhost:5173

---

## Tests / Lint / Build
```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

---

## Prisma troubleshooting (common)

- **`Environment variable not found: DATABASE_URL`**  
  Ensure `apps/api/.env` exists and includes `DATABASE_URL="file:./dev.db"`.

- **`P2021` (table not found)**  
  Run:
  ```bash
  pnpm --filter @takehome/api db:push
  pnpm --filter @takehome/api db:seed
  ```

- **Seed fails with missing client**  
  Run:
  ```bash
  pnpm --filter @takehome/api prisma generate
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

## Tradeoffs / Known Limitations

### Authentication & Security
- **Dual state management**: Auth state (user info) is stored in localStorage for quick UI access, while the actual session is managed via httpOnly JWT cookie for security
- **No refresh tokens**: JWT tokens don't expire in this implementation. Production would need token refresh and proper expiration handling
- **No password complexity requirements**: Only minimum length validation (6 chars). Production should enforce stronger password policies
- **No rate limiting**: API endpoints lack rate limiting protection against brute force attacks
- **SQLite in production**: Using SQLite for simplicity. Production would need PostgreSQL/MySQL with connection pooling

### Database & Performance
- **No database migrations**: Schema changes would require manual intervention. Production should use Prisma Migrate or similar
- **No query optimization**: Some N+1 queries exist (e.g., loading tasks with comments). Would benefit from `include` clauses and dataloader patterns
- **No pagination for comments**: Comments load all at once. Large comment threads would benefit from pagination
- **Case-sensitive search**: SQLite search is case-sensitive (removed `mode: "insensitive"`). Production with PostgreSQL would support case-insensitive search
- **No database indexes beyond basic ones**: Complex queries would benefit from additional composite indexes

### Frontend Architecture
- **No error boundaries**: React errors can crash the entire UI. Production needs error boundaries with fallback UI
- **Simple caching**: TanStack Query uses default cache settings. Production would need fine-tuned cache invalidation strategies
- **No optimistic updates (except task move)**: Most mutations wait for server response. UX would benefit from optimistic UI updates
- **Local state only**: No global state management (Redux/Zustand). Works for small app but limits scalability
- **No offline support**: App requires constant internet connection. PWA features would improve UX

### Testing
- **Limited test coverage**: Tests cover happy paths only. Missing edge cases, error states, and integration scenarios
- **No E2E tests**: Only unit and integration tests. Production should have Playwright/Cypress E2E tests
- **Tests run sequentially**: Configured with `singleFork` to avoid database conflicts. Slower but more reliable for SQLite
- **Mocked API in frontend tests**: Frontend tests mock fetch. True integration tests would hit real API

### UI/UX
- **No responsive mobile layout**: UI is desktop-first. Mobile experience needs optimization
- **No keyboard shortcuts**: Power users would benefit from keyboard navigation (j/k for tasks, / for search, etc.)
- **No drag preview customization**: Drag-and-drop uses default styling. Could show task preview during drag
- **No undo/redo**: Critical operations (delete, move) lack undo capability
- **No bulk operations**: Can't select and move/delete multiple tasks at once
- **No task filtering**: Only search by title. Would benefit from filtering by priority, date, column, etc.

### Code Quality
- **Limited error handling**: Some error paths return generic messages. Production needs detailed error codes and logging
- **No logging/monitoring**: No structured logging or APM. Production needs observability (DataDog, Sentry, etc.)
- **No input sanitization**: Basic validation only. Production needs XSS prevention and input sanitization
- **Minimal comments**: Code is readable but lacks JSDoc comments for complex functions
- **No API versioning**: API routes lack versioning (/v1/). Breaking changes would affect all clients

### Development Experience
- **No Docker setup**: Developers need to install dependencies locally. Docker Compose would simplify onboarding
- **No .env validation**: Missing environment variables fail silently. Should use Zod to validate env vars at startup
- **No pre-commit hooks**: No Husky/lint-staged to enforce code quality before commits
- **Manual database seeding**: Seed script exists but not automated. Dev environment would benefit from auto-seeding

### Features Not Implemented
- **No task assignments**: Can't assign tasks to specific users (though architecture supports it via User relation)
- **No task due dates**: No deadline tracking or overdue indicators
- **No task labels/tags**: Can't categorize tasks beyond columns
- **No file attachments**: Can't attach files or images to tasks
- **No activity feed**: No audit trail of who changed what and when
- **No real-time updates**: Multiple users see stale data until refresh. Would benefit from WebSockets/SSE
- **No column reordering**: Columns are fixed. UI doesn't support dragging columns
- **No task archiving**: Deleted tasks are gone forever. Should support soft deletes and archiving

### Known Bugs & Quirks
- None identified at this time. Please report issues if found during review.
