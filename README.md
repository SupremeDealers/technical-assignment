# Team Boards — Submission

**Full-stack Kanban board application** built for the Team Boards take-home assignment.  
Implements task management with authentication, comments, and column workflows.

## Tech Stack

### Backend

- **Node.js**
- **Express**
- **TypeScript**
- **SQLite**
- **Zod** (validation)
- **JWT** (authentication)
- **bcrypt** (password hashing)

### Frontend

- **React (Vite)**
- **TypeScript**
- **TanStack Query**
- **React Router**
- **Tailwind CSS**

### Tooling

- **pnpm workspaces**
- **ESLint + Prettier**
- **Vitest / Testing Library**
- **GitHub Actions CI**

---

## Features

### Auth

- Register / Login
- JWT authentication
- Protected routes

### Boards & Columns

- View board
- Create / edit / delete columns

### Tasks

- Create tasks
- Edit tasks
- Delete tasks
- Move between columns
- Pagination & search

### Comments

- View comments
- Add comments

---

## Tests

Run all tests:

```
pnpm test
```

Covers API routes and UI flows.

---

## Setup

### Install dependencies

```
pnpm install
```

### Run development servers

```
pnpm dev
```

### Local URLs

- **API:** [http://localhost:4000](http://localhost:4000)
- **Web:** [http://localhost:5173](http://localhost:5173)

---

### Seed Data

The seed script sets up the following demo data:

- Demo user
- Board
- Columns
- Tasks
- Comments

Run the seed script:

```
pnpm seed
```

### ⚖️ Tradeoff

SQLite was chosen for portability and ease of setup.  
In a production environment, PostgreSQL with managed migrations would be preferred for scalability and reliability.

---

### 🎥 Demo

Loom walkthrough:  
https://www.loom.com/share/f3cac268939d4b3c950c41f421619eda

---

### Author

**Cyril Asogwa**  
UI Engineer / Full-Stack Developer

Portfolio: [https://cyrilasogwa.dev](https://cyrilasogwa.dev)
