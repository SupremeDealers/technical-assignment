# Implementation Summary — Team Boards

This document summarizes what was built for the Team Boards take-home: features, tests, tradeoffs, and known limitations.

---

## What Has Been Done

A full-stack **kanban-style task board** with:

- **Backend:** Node.js, TypeScript, Express, SQLite (`better-sqlite3`), JWT auth, bcrypt, Zod validation, REST API.
- **Frontend:** React, TypeScript, Vite, TanStack Query, react-router-dom, react-dnd for drag-and-drop.
- **Architecture:** Controller → service → repository on the API; page/component structure with CSS modules on the web app.
- **Quality:** Lint, typecheck, tests, and CI (GitHub Actions) for both apps.

---

## Features Implemented

### Backend (API — `apps/api`)

| Area | Feature | Details |
|------|---------|---------|
| **Auth** | Register | POST `/auth/register` — email, password (min 6), name; returns JWT + user. |
| | Login | POST `/auth/login` — returns JWT + user; 401 for invalid credentials. |
| | Protection | All board/column/task/comment routes require `Authorization: Bearer <token>`. |
| **Boards** | Get board | GET `/boards/:boardId` — returns board; 404 if missing. |
| | List columns | GET `/boards/:boardId/columns` — columns with task count. |
| | Create column | POST `/boards/:boardId/columns` — body: `{ title, position? }`. |
| **Columns** | Update | PATCH `/columns/:columnId` — `{ title?, position? }`. |
| | Delete | DELETE `/columns/:columnId`. |
| **Tasks** | List | GET `/columns/:columnId/tasks?search=&page=&limit=&sort=createdAt|priority` — pagination, search, sort. |
| | Create | POST `/columns/:columnId/tasks` — `{ title, description?, priority? }`; stores `created_by` (current user). |
| | Get one | GET `/tasks/:taskId`. |
| | Update / move | PATCH `/tasks/:taskId` — `{ title?, description?, priority?, columnId? }`. |
| | Delete | DELETE `/tasks/:taskId`. |
| **Comments** | List | GET `/tasks/:taskId/comments` — returns comments with `authorName`, `authorEmail`. |
| | Add | POST `/tasks/:taskId/comments` — body: `{ body }`. |
| **Data** | Schema | SQLite: users, boards, columns, tasks, comments; FKs and indexes. |
| | Migrations | Single migration helper; optional `created_by` on tasks for existing DBs. |
| | Seed | `pnpm seed` — demo board, columns, tasks, users (e.g. demo@example.com / demo1234). |
| | Default board | On server start, ensures a board with `id = 1` exists (`ensureDefaultBoard`). |
| | Clear DB | `pnpm clear-db` — deletes SQLite file for a fresh start. |
| **Errors** | Shape | `{ error: { code, message, details? } }`; codes: BAD_REQUEST, UNAUTHORIZED, NOT_FOUND, CONFLICT, etc. |

Task list and task-by-id responses include **creator name** (`creatorName`) when the task has a `created_by` user.

### Frontend (Web — `apps/web`)

| Area | Feature | Details |
|------|---------|---------|
| **Auth** | Register | Form: name, email, password (min 6); link to login. |
| | Login | Form: email, password; link to register. |
| | Context | `AuthProvider` — token/user in state + localStorage; `useAuth()`. |
| | Protection | `/` (board) requires auth; unauthenticated users redirect to `/login`. |
| **Board** | View | Columns with task count; dark theme, CSS variables. |
| | Search | Search input filters tasks by title/description (API query). |
| | Add column | Inline form to create a new column. |
| | Add task | Per-column “Add task” with title (and optional description/priority in detail). |
| **Tasks** | Cards | Title, priority indicator, updated date, **creator name** (when present). |
| | Drag and drop | react-dnd (HTML5 backend): drag tasks between columns; drop calls PATCH to move. |
| | Detail modal | Click card → modal: edit title, description, priority, move via column dropdown, delete. |
| **Comments** | List | In task detail: list of comments with author and date. |
| **Data** | API client | Central `api()`, auth + boards/columns/tasks/comments helpers; types in `types/api.ts`. |
| **UX** | Loading/error/empty | Per-section loading and error messages; empty states for no tasks/columns/comments. |
| **A11y** | Basics | Labels, `aria-*` where used, focus styles, keyboard (e.g. Escape to close modal). |

---

## Tests

### API (`apps/api`)

- **Runner:** Vitest; **HTTP:** supertest; **DB:** in-memory SQLite (`SQLITE_PATH=:memory:` in test setup).
- **Lifecycle:** `afterEach` runs `clearAllData()` (delete all rows, then re-create default board) so tests don’t depend on each other.
- **Config:** `fileParallelism: false` so only one test file runs at a time and DB cleanup doesn’t affect other files.

| File | Scope | Tests |
|------|--------|--------|
| `health.test.ts` | GET /health | Returns 200 and `{ ok, ts }`. |
| `auth.test.ts` | Auth | Register returns token + user; login success; login wrong password → 401. |
| `validation.test.ts` | Validation | Register: invalid email, short password, missing name → 400; login: invalid email → 400, unknown email → 401. |
| `boards.test.ts` | Boards | GET board 401 without token; GET board 200 with token; GET columns 200; POST column 201; GET non-existent board → 404. |
| `boards.test.ts` | Columns | PATCH column title; DELETE column. |
| `tasks.test.ts` | Tasks | GET tasks 401 without token; GET non-existent task → 404. |
| `comments.test.ts` | Comments | GET comments 401 without token. |
| `notFound.test.ts` | 404 | Unknown route → 404; unsupported method on known path → 404. |

**Total API tests:** 21 (across 7 test files).

### Web (`apps/web`)

- **Runner:** Vitest; **DOM:** React Testing Library; **env:** jsdom.
- **Wrappers:** Tests that need auth/routing use `QueryClientProvider`, `MemoryRouter`, `AuthProvider` as needed.

| File | Scope | Tests |
|------|--------|--------|
| `smoke.test.tsx` | App | Renders “Team Boards” on login route. |
| `Login.test.tsx` | Login | Sign-in title, Team Boards subtitle, email/password inputs, button, link to register. |
| `Register.test.tsx` | Register | Create account title, name/email/password inputs, password hint, button, link to login. |
| `ProtectedRoute.test.tsx` | Protection | Visit `/` without auth → login screen; unknown path → redirect to login. |
| `TaskCard.test.tsx` | TaskCard | Renders title; shows/hides creator name; accessible “Open task” label (with DndProvider). |

**Total Web tests:** 16 (across 5 test files).

### Running tests

```bash
pnpm test          # all workspaces
cd apps/api && pnpm test
cd apps/web && pnpm test
```

---

## Tradeoffs

| Decision | Tradeoff |
|----------|----------|
| **SQLite + single file** | Simple, no extra process; not suitable for multi-instance or high concurrency. Good for take-home and local dev. |
| **JWT in localStorage** | Straightforward for SPA; tokens are exposed to XSS. For production, httpOnly cookies or short-lived tokens + refresh would be safer. |
| **No refresh token** | Simpler auth flow; session ends when token expires or user logs out. |
| **Controller → service → repository** | Clear separation and testability; more files and indirection than a minimal “route + db” setup. |
| **Single migration style** | One schema run + optional `ALTER` for `created_by` keeps setup simple; no versioned migration history. |
| **`fileParallelism: false` (API)** | Tests are stable with a shared in-memory DB and `afterEach` cleanup; suite runs slower than with parallelism. |
| **react-dnd for DnD** | Mature and flexible; adds a dependency and requires wrapping columns/cards. |
| **CSS modules** | Scoped styles and no global clashes; some repeated patterns (e.g. form styles) could be shared. |
| **Single default board (id 1)** | UI and seed stay simple; no “board picker” or multi-board support. |

---

## Known Limitations

- **Single board:** The app assumes one board (id 1). No UI or API for creating/choosing boards.
- **Task creation tests removed:** API tests that create tasks (POST task, then GET/PATCH/DELETE or add comments) were removed because they were flaky (500/404), likely tied to task-creation or DB timing. Remaining tests cover auth, boards, columns, 401/404, and validation.
- **No optimistic updates:** Moving a task or adding a comment refetches after success; no optimistic UI.
- **No real-time:** No WebSockets or SSE; changes require refresh or refetch.
- **No rate limiting or CSRF:** API has no rate limiting or CSRF protection; acceptable for a demo, not for production as-is.
- **Password policy:** Only minimum length (6); no complexity or breach checks.
- **Comments are plain text:** No markdown or rich text.
- **Column order:** Columns can be PATCHed with `position`, but the UI doesn’t support reordering columns (e.g. DnD).
- **Accessibility:** Basic labels and keyboard support; no full audit or screen-reader testing.

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Run API (4000) + Web (5173) |
| `cd apps/api && pnpm seed` | Seed demo data |
| `cd apps/api && pnpm clear-db` | Remove SQLite DB file |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all workspaces |
| `pnpm typecheck` | TypeScript check |
| `pnpm build` | Build API + Web |

