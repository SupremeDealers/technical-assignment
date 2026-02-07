# Team Boards — Kanban Task Management

A full-stack kanban-style board application with tasks and comments, built with React, Node.js, Express, and SQLite.

## 🚀 Features

### Backend (Node.js + Express)
- **Authentication**: JWT-based auth with register/login
- **RESTful API**: Full CRUD for boards, columns, tasks, and comments
- **Database**: SQLite with better-sqlite3 for local persistence
- **Validation**: Zod schemas for request validation
- **Pagination & Search**: Tasks support pagination and search
- **Error Handling**: Consistent error shape across all endpoints

### Frontend (React + Vite)
- **Modern React**: React 18 with TypeScript
- **Routing**: React Router v6 for navigation
- **State Management**: TanStack Query for server state
- **Drag & Drop**: @dnd-kit for moving tasks between columns
- **Responsive Design**: Mobile-friendly CSS
- **Accessibility**: Proper labels, keyboard navigation, focus management

---

## 📋 Prerequisites

- Node.js (see \`.nvmrc\` for version)
- pnpm (recommended package manager)

---

## 🛠️ Getting Started

### 1. Install dependencies
\`\`\`bash
pnpm install
\`\`\`

### 2. Seed the database (creates demo data)
\`\`\`bash
pnpm seed
\`\`\`

### 3. Start development servers
\`\`\`bash
pnpm dev
\`\`\`

This starts both:
- **API**: http://localhost:4000
- **Web**: http://localhost:5173

### Demo Credentials
After seeding, you can login with:
- **Email**: \`alice@example.com\`
- **Password**: \`password123\`

Other demo users: \`bob@example.com\`, \`charlie@example.com\` (same password)

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| \`pnpm dev\` | Start both API and web in development mode |
| \`pnpm build\` | Build both applications for production |
| \`pnpm test\` | Run all tests |
| \`pnpm lint\` | Lint all code |
| \`pnpm typecheck\` | Run TypeScript type checking |
| \`pnpm seed\` | Seed the database with demo data |

---

## 🏗️ Project Structure

\`\`\`
├── apps/
│   ├── api/                 # Backend Express API
│   │   ├── src/
│   │   │   ├── config.ts    # Configuration
│   │   │   ├── db.ts        # Database setup & schema
│   │   │   ├── errors.ts    # Error utilities
│   │   │   ├── index.ts     # Express app entry
│   │   │   ├── schemas.ts   # Zod validation schemas
│   │   │   ├── seed.ts      # Database seeder
│   │   │   ├── types.ts     # TypeScript types
│   │   │   ├── middleware/  # Auth middleware
│   │   │   └── routes/      # API route handlers
│   │   └── test/            # API tests
│   │
│   └── web/                 # Frontend React app
│       ├── src/
│       │   ├── api/         # API client functions
│       │   ├── components/  # Reusable UI components
│       │   ├── contexts/    # React contexts (auth)
│       │   ├── pages/       # Page components
│       │   ├── styles/      # Global CSS
│       │   └── ui/          # App root component
│       └── test/            # Frontend tests
│
├── package.json             # Root workspace config
└── pnpm-workspace.yaml      # pnpm workspace config
\`\`\`

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | \`/auth/register\` | Register a new user |
| POST | \`/auth/login\` | Login and get JWT token |
| GET | \`/auth/me\` | Get current user info |

### Boards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/boards\` | List all boards for user |
| POST | \`/boards\` | Create a new board |
| GET | \`/boards/:boardId\` | Get board with columns |
| PATCH | \`/boards/:boardId\` | Update board |
| DELETE | \`/boards/:boardId\` | Delete board |
| GET | \`/boards/:boardId/columns\` | Get columns with task counts |
| POST | \`/boards/:boardId/columns\` | Create a new column |

### Columns
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | \`/columns/:columnId\` | Update column |
| DELETE | \`/columns/:columnId\` | Delete column (must be empty) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/columns/:columnId/tasks\` | List tasks (with search/pagination) |
| POST | \`/columns/:columnId/tasks\` | Create a task |
| GET | \`/tasks/:taskId\` | Get task details |
| PATCH | \`/tasks/:taskId\` | Update task (including move) |
| DELETE | \`/tasks/:taskId\` | Delete task |

**Query Parameters for GET tasks:**
- \`search\` - Search in title/description
- \`page\` - Page number (default: 1)
- \`limit\` - Items per page (default: 20, max: 100)
- \`sort\` - Sort by: \`createdAt\`, \`priority\`, \`position\`
- \`order\` - Sort order: \`asc\`, \`desc\`

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/tasks/:taskId/comments\` | List comments for a task |
| POST | \`/tasks/:taskId/comments\` | Add a comment |
| PATCH | \`/comments/:commentId\` | Update comment (author only) |
| DELETE | \`/comments/:commentId\` | Delete comment (author only) |

### Error Response Format
\`\`\`json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid payload",
    "details": [{ "path": "title", "issue": "Required" }]
  }
}
\`\`\`

---

## 🎨 Architecture Decisions & Tradeoffs

### 1. SQLite for Database
**Decision**: Used SQLite with better-sqlite3 for local persistence.

**Tradeoffs**:
- ✅ Zero configuration, file-based storage
- ✅ Fast for development and testing
- ✅ Synchronous API (simpler code)
- ❌ Not suitable for production at scale
- ❌ No concurrent write support

### 2. JWT Authentication
**Decision**: Stateless JWT tokens stored in localStorage.

**Tradeoffs**:
- ✅ Simple to implement
- ✅ Works well with REST APIs
- ✅ No server-side session storage needed
- ❌ Cannot invalidate tokens (except expiry)
- ❌ localStorage is vulnerable to XSS

### 3. @dnd-kit for Drag & Drop
**Decision**: Used @dnd-kit instead of react-beautiful-dnd.

**Tradeoffs**:
- ✅ Modern, actively maintained
- ✅ Better TypeScript support
- ✅ Smaller bundle size
- ✅ More flexible API
- ❌ Slightly more setup required

### 4. TanStack Query for Server State
**Decision**: Used TanStack Query for all API calls.

**Tradeoffs**:
- ✅ Automatic caching and refetching
- ✅ Optimistic updates support
- ✅ Loading/error states built-in
- ✅ Reduces boilerplate significantly
- ❌ Learning curve for mutations

### 5. CSS without Framework
**Decision**: Custom CSS with CSS variables.

**Tradeoffs**:
- ✅ Full control over styling
- ✅ No external dependencies
- ✅ Better understanding of styles
- ❌ More code to write
- ❌ No pre-built components

---

## 🧪 Testing

The project includes:
- **API Tests**: Health checks, auth flow, protected routes
- **Frontend Tests**: Component rendering, form validation

Run tests:
\`\`\`bash
pnpm test
\`\`\`

---

## 🔮 Future Improvements

If I had more time, I would add:

1. **Real-time updates** - WebSocket for live collaboration
2. **Optimistic updates** - Better UX when moving tasks
3. **User avatars** - Upload profile pictures
4. **Board sharing** - Invite members via email
5. **Task due dates** - Calendar integration
6. **Labels/tags** - Categorize tasks
7. **Dark mode** - Theme switching
8. **E2E tests** - Playwright/Cypress for full flows
9. **Rate limiting** - Protect API from abuse
10. **Refresh tokens** - Better token management

---

## 📝 Known Limitations

1. No email verification on registration
2. Passwords are hashed but no password reset flow
3. No file attachments on tasks
4. No activity log/history
5. Limited mobile touch support for drag & drop
6. No offline support

---

## 🙏 Acknowledgments

- [TanStack Query](https://tanstack.com/query) - Server state management
- [@dnd-kit](https://dndkit.com/) - Drag and drop
- [Zod](https://zod.dev/) - Schema validation
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite driver

---

## 📄 License

This project is for demonstration purposes as part of a technical assessment.
