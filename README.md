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
# First-time setup: initialize database
pnpm -C apps/api db:migrate
pnpm -C apps/api db:seed

# Start development servers
pnpm dev
```

- API: http://localhost:4000 (health: `/health`)
- Web: http://localhost:5173
- **Demo Login:** email: `demo@example.com` / password: `password123`

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
- Auth works and blocks unauth'd access
- Create/edit/move task works
- Search + pagination works
- Comments view/add works
- CI is green; tests are meaningful
- README explains tradeoffs + known limitations

---

## Implementation Notes

### What was built

This implementation includes:

**Backend (Express + Prisma + SQLite)**
- Complete auth system (register/login with JWT)
- All REST endpoints for boards, columns, tasks, comments
- Comprehensive error handling with consistent error shapes
- Search and pagination on tasks
- Database seed with demo data
- Unit tests for auth and board endpoints

**Frontend (React + TanStack Query)**
- Auth flow with persistent sessions (localStorage)
- Full kanban board UI with drag-and-drop
- Task creation, editing, deletion, and movement
- Task detail modal with comments section
- Board management (create, list, delete)
- Loading and error states throughout

**Key Design Decisions:**
- SQLite for zero-config local development
- JWT for stateless authentication
- Position-based ordering for drag-and-drop
- Inline styles for simplicity (can be refactored to Tailwind)
- React Query for data fetching and caching

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for full technical details and architectural decisions.

### Demo Video Guidelines

A 3-5 minute video should demonstrate:
1. Register/login flow
2. Create a board and add tasks
3. Drag a task between columns
4. Open task detail and add a comment
5. Run tests and show passing results
6. Briefly discuss 1-2 key tradeoffs

### Known Limitations

- SQLite doesn't scale to high concurrency (use PostgreSQL for production)
- Drag-and-drop has limited keyboard accessibility
- No real-time sync (multiple users see stale data)
- Search is basic substring matching
- No user invitations/sharing beyond board ownership

All limitations are documented in [IMPLEMENTATION.md](./IMPLEMENTATION.md).
