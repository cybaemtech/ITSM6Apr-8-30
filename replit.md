# IT Helpdesk Portal

## Overview
A full-stack IT helpdesk and ticketing system with a React frontend and Express backend.

## Architecture
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, Shadcn UI, Wouter routing, TanStack Query
- **Backend**: Express.js with TypeScript, Drizzle ORM, Passport.js auth
- **Database**: PostgreSQL (Replit-managed via `DATABASE_URL`)
- **Session**: In-memory session store (memorystore)

## Key Directories
- `client/` — React frontend (entry: `client/src/main.tsx`)
- `server/` — Express backend (entry: `server/index.ts`)
- `server/site-engg/` — Site engineering sub-module (uses JSON file storage)
- `shared/schema.ts` — Drizzle ORM schema (PostgreSQL) + Zod validation types
- `uploads/` — File upload storage

## Running the App
- **Dev**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build`
- **DB schema push**: `npm run db:push`

## Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (set by Replit)
- `SESSION_SECRET` — Express session secret
- `PORT` — Server port (default: 5000)
- `VITE_API_URL` — API base URL for frontend (default: `/api`)
- `VITE_APP_NAME` — App display name

## Migration Notes (Replit Migration)
- Migrated database from MySQL to PostgreSQL (Replit provides PostgreSQL)
- `shared/schema.ts`: Changed from `mysqlTable`/`int`/`boolean` → `pgTable`/`integer`/`boolean`/`serial`
- `server/db.ts`: Changed from `mysql2` + `drizzle-orm/mysql2` → `pg` + `drizzle-orm/node-postgres`
- `PORT` env var set to `5000` for Replit compatibility
- `drizzle.config.ts` was already configured for PostgreSQL

## User Roles
- **admin** — Full access (username: `admin`, password: `admin123`)
- **agent** — Support staff access (username: `agent`, password: `agent123`)
- **user** — End user access (username: `user`, password: `user123`)
