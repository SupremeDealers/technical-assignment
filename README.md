# Team Boards – Take-Home Assignment

A small Kanban-style board application with authentication, tasks, and comments.

Built as part of a take-home assessment using React and Node.js, with a focus on correctness, clarity, and developer experience rather than visual polish.

---

## ✨ Features

- User authentication (register / login)
- Kanban board with columns and tasks
- Create, update, and move tasks between columns
- Task search and pagination
- Task comments
- Loading, error, and empty states
- Seeded demo data for quick testing
- Basic backend tests

---

## 🧱 Tech Stack

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- SQLite (local persistence)
- JWT authentication
- Zod validation
- Vitest + Supertest (tests)

### Frontend

- React
- Vite
- TypeScript
- TailwindCSS
- TanStack Query
- React Router
- Axios

---

## 📂 Project Structure (simplified)

apps/
api/ # Backend (Express + Prisma)
web/ # Frontend (React + Vite)

---

## ⚙️ Setup Instructions

### Requirements

- Node.js 22+
- pnpm

### Install dependencies

From the repo root:

```bash
pnpm install

🗄 Database Setup

From apps/api:

npx prisma migrate dev
npx prisma db seed

# This will create the SQLite database and seed demo data (user, board, columns, tasks, comments).

🔐 Demo Credentials

Email: dmj@dev.co
Password: password123

▶️ Running the App

From the repo root:

pnpm dev

Frontend: http://localhost:5173

Backend API: http://localhost:4000
```

## 🧪 Tests

Basic backend tests are included.

From the repo root or apps/api:

pnpm test

Tests cover:

Health check endpoint

Authenticated task listing

Unauthorized access rejection


### 🧠 Assumptions & Tradeoffs

Single board per user for MVP scope

Task movement implemented using a dropdown instead of full drag-and-drop

SQLite used for simplicity and easy local setup

Minimal styling focused on usability and clarity

### 📦 External Libraries

Prisma

TanStack Query

TailwindCSS

Axios