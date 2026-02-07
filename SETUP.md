# Quick Start Guide

## Prerequisites

- Node.js (16+)
- pnpm (recommended) or npm

## Installation

1. **Clone and install:**
   ```bash
   git clone <https://github.com/SupremeDealers/technical-assignment.git>
   cd technical-assignment
   pnpm install
   ```

2. **Initialize database:**
   ```bash
   # Run migrations to create schema
   pnpm -C apps/api db:migrate

   # Seed with demo data
   pnpm -C apps/api db:seed
   ```

3. **Start development servers:**
   ```bash
   pnpm dev
   ```

   This starts:
   - **API:** http://localhost:4000
   - **Web:** http://localhost:5173

## First Time Using the App

1. Go to http://localhost:5173
2. Click "Login"
3. Use demo credentials:
   - **Email:** demo@example.com
   - **Password:** password123
4. You'll see a pre-populated board with tasks in different columns

## What You Can Do

- **Create a board:** Click "Create New Board" on the list page
- **Rename a board:** Click the pencil icon next to the board title
- **Delete a board:** Click the trash icon next to the board title
- **Add a column:** Click "Add Column" at the end of the column list
- **Rename a column:** Click the pencil icon next to the column title
- **Delete a column:** Click the trash icon next to the column title
- **Create a task:** Click the "+" button at the bottom of any column
- **Edit a task:** Click the task to open up the task detail modal, then double click the title to edit it, and click the description to edit that as well.
- **Move a task:** Drag it between columns
- **View task details:** Click "Open" on any task card
- **Add a comment:** In the task detail modal, type in "Add a comment..." and click submit
- **Edit a task:** In the task detail modal, click "Edit" to change title/description
- **Delete a task:** Click the "X" button on a task card

## Available Commands

```bash
# Development
pnpm dev              # Start both API and Web servers
pnpm -C apps/api dev  # API only
pnpm -C apps/web dev  # Web only

# Testing
pnpm test             # Run all tests
pnpm -C apps/api test # API tests only

# Code quality
pnpm lint             # Check linting
pnpm typecheck        # Check TypeScript
pnpm build            # Build for production

# Database
pnpm -C apps/api db:migrate  # Run migrations
pnpm -C apps/api db:seed     # Reset and seed demo data
pnpm -C apps/api db:reset    # Reset database completely
```

## Project Structure

```
.
├── apps/
│   ├── api/              # Node.js + Express backend
│   │   ├── src/
│   │   │   ├── index.ts  # Main app
│   │   │   ├── auth.ts   # Auth utilities
│   │   │   ├── db.ts     # Prisma client
│   │   │   └── routes/   # API endpoints
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # Database schema
│   │   │   └── seed.ts        # Seed script
│   │   └── test/         # API tests
│   │
│   └── web/              # React + Vite frontend
│       ├── src/
│       │   ├── main.tsx  # Entry point
│       │   ├── context/  # Auth context
│       │   ├── lib/      # API client
│       │   ├── pages/    # Page components
│       │   ├── components/ # UI components
│       │   └── ui/       # Main App component
│       └── test/         # Frontend tests
│
├── README.md            # This file
├── IMPLEMENTATION.md    # Technical details
└── SETUP.md            # This setup guide
```

## Troubleshooting

### "Cannot find module" errors
```bash
pnpm install
```

### Database errors
```bash
# Reset database completely
pnpm -C apps/api db:reset

# Re-seed with demo data
pnpm -C apps/api db:seed
```

### Port already in use
- API uses port 4000 (change with `PORT=5000 pnpm -C apps/api dev`)
- Web uses port 5173 (Vite handles this automatically)

### Authentication issues
- Make sure you're logged in (check localStorage in DevTools)
- Try logging out and back in
- Clear localStorage and refresh: `localStorage.clear()` in DevTools console

## Next Steps

- Read [IMPLEMENTATION.md](./IMPLEMENTATION.md) for architecture details
- Check test files for API contract examples
- Explore the component structure in `apps/web/src/components/`

## Support

If you encounter issues:
1. Check the API logs in the terminal running `pnpm dev`
2. Check browser DevTools console for frontend errors
3. Verify the database exists: `ls apps/api/dev.db`
