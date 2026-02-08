# Team Boards — React + Node

A small kanban-style board with tasks and comments, backed by a Node (Express) API and a React (Vite) app.

---

## Features

- Auth: register/login with JWT (Bearer token)
- Board UI: columns + task cards
- Tasks: create, edit, delete, move across columns; drag & drop reorder when sorted by Order
- Task details: view/edit task + comments list + add comment
- Column management: create/update/delete columns
- Task list UX: search + pagination + sorting (order/createdAt/priority)
- Consistent API error shape

### Demo video

Demo video link: https://www.loom.com/share/b06e32dbd5f74c3297e53bf694a7c751

A 5 minute recording showing login/register, create/move task, add comment, tests (`pnpm test`), decisions + tradeoffs.

---

## Getting Started

### Prereqs

- Node (see `.nvmrc`)
- pnpm

### Install

```bash
pnpm install
```

### Run (API + Web)

```bash
pnpm dev
```

- API: http://localhost:4000 (`/health`)
- Web: http://localhost:5173

### Seed demo data (optional)

```bash
pnpm --filter @takehome/api seed
```

Demo user (from `apps/api/.env.development`):

- email: `demo@example.com`
- password: `Pwd@1234`

### Tests / Lint / Build

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

---

## Architecture

- `apps/api`: Express + TypeScript, SQLite (`better-sqlite3`), Zod validation, JWT auth
- `apps/web`: React + TypeScript (Vite), TanStack Query, React Router, Tailwind, dnd-kit
- DB file: `takehome.db` at repo root (delete it to reset, or re-run seed)

---

## Technical Decision & Tradeoff

- Decision: I chose to use a simple way to manage state on the client side instead of adding a large state management library.
- Benefit: The main benefit of this decision is that it was faster to set up and easier to understand. I was able to focus on building features without writing a lot of extra boilerplate code.
- Tradeoff: The tradeoff is that this approach may become harder to manage as the application grows and becomes more complex.
- Why this was acceptable: I accepted this tradeoff because the scope of the project is small and I had limited time to complete the assignment.
- Future improvement: If I had more time, I would refactor the client state into a more structured and scalable state management solution.

---

## API

Base URL: `http://localhost:4000`

All routes (except `/health` and `/auth/*`) require:

- `Authorization: Bearer <token>`

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

### Endpoints

Auth:

- POST `/auth/register`
- POST `/auth/login`

Boards / Columns:

- GET `/boards/me`
- GET `/boards/:boardId`
- GET `/boards/:boardId/columns`
- POST `/boards/:boardId/columns`
- PATCH `/columns/:columnId`
- DELETE `/columns/:columnId`

Tasks:

- GET `/columns/:columnId/tasks?search=&page=&limit=&sort=order|createdAt|priority`
- POST `/columns/:columnId/tasks`
- GET `/tasks/:taskId`
- PATCH `/tasks/:taskId`
- DELETE `/tasks/:taskId`

Comments:

- GET `/tasks/:taskId/comments`
- POST `/tasks/:taskId/comments`

---

## Quick Checks

- `pnpm install && pnpm dev`
- Register/login → board loads
- Create/edit/delete task; move task across columns; reorder via drag & drop (when sorted by Order)
- Search/pagination/sort work per column
- Comments list + add comment work
- `pnpm test` passes
