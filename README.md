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

## Implementation Decisions & Tradeoffs

### Key Decisions

**1. Client-Side Filtering for Search/Priority**
- **Decision**: Fetch all tasks once and filter on the client using `useMemo`
- **Tradeoff**: Better UX (instant filtering, no API calls on each keystroke) but doesn't scale beyond ~1000 tasks
- **Why**: For a kanban board, most teams have <100 active tasks. Eliminated network latency and prevented task duplication bugs when filtering across multiple columns
- **Alternative**: Server-side filtering with debounced search would scale better but adds complexity and latency

**2. shadcn/ui with Tailwind CSS v4**
- **Decision**: Used shadcn/ui component library with Tailwind v4
- **Tradeoff**: Modern, accessible components but requires manual component installation and larger bundle
- **Why**: Provides production-ready accessible components (ARIA, keyboard navigation) without reinventing the wheel. Tailwind v4 offers better performance with PostCSS plugin
- **Alternative**: Plain CSS or styled-components would reduce dependencies but require more accessibility work

**3. React Hook Form + Zod Validation**
- **Decision**: Unified form handling with React Hook Form and Zod schemas
- **Tradeoff**: Additional dependencies but robust validation and better UX
- **Why**: Reduces re-renders, provides instant client-side validation, matches backend Zod schemas for consistency
- **Alternative**: Controlled forms with useState would be simpler but more verbose and harder to validate

**4. @dnd-kit for Drag-and-Drop**
- **Decision**: Used @dnd-kit instead of react-beautiful-dnd
- **Tradeoff**: Modern API with better accessibility but less mature ecosystem
- **Why**: react-beautiful-dnd is no longer maintained. @dnd-kit has built-in keyboard navigation and screen reader support
- **Alternative**: HTML5 drag-and-drop API would remove dependency but poor accessibility

**5. SQLite for Persistence**
- **Decision**: SQLite with Drizzle ORM
- **Tradeoff**: Simple setup, file-based, but single-writer limitation
- **Why**: Zero configuration, type-safe queries, perfect for demo/MVP. Drizzle provides excellent TypeScript DX
- **Alternative**: PostgreSQL would handle concurrency better but requires separate server setup

### Known Limitations

**Performance**
- Client-side filtering breaks down with >1000 tasks (needs server-side pagination)
- All tasks loaded on mount (could implement virtual scrolling for large lists)
- No query debouncing on search (works fine with current data size)

**Features Not Implemented**
- Real-time updates (no WebSockets—requires manual refresh to see other users' changes)
- Task assignments (can only see task creator, not assignees)
- Due dates and reminders
- File attachments on tasks
- Bulk operations (multi-select, batch delete/move)
- Column reordering via drag-and-drop (can edit position manually)
- Activity log/audit trail

**Scalability**
- SQLite is single-writer (would need PostgreSQL for high concurrency)
- No caching layer (Redis) for sessions or frequently accessed data
- JWT stored in localStorage (vulnerable to XSS; httpOnly cookies would be more secure)
- No rate limiting on API endpoints

**Testing**
- Limited test coverage (smoke tests only)
- No E2E tests (Playwright/Cypress would catch integration issues)
- No API integration tests with real database

**DevOps**
- No Docker setup (manual Node/pnpm installation required)
- No production build optimizations (code splitting, CDN, etc.)
- Environment variables not documented (needs .env.example)

### Future Improvements (Priority Order)

1. **Server-side pagination**: Add `?page=&limit=` to tasks endpoint, implement infinite scroll
2. **Real-time updates**: WebSocket for live collaboration
3. **Security hardening**: httpOnly cookies, rate limiting, input sanitization
4. **Test coverage**: Add integration tests, E2E tests, aim for >80% coverage
5. **Performance**: Implement virtual scrolling, query debouncing, React.memo optimizations
6. **Docker**: Add Dockerfile and docker-compose for easy deployment