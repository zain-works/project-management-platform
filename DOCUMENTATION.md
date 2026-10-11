# Project Management Platform — Architecture Overview

## Overview & Tech Stack

A full-stack, monorepo-based TypeScript web application designed for team collaboration, task management, and project tracking.

| Layer | Technologies | Responsibilities |
|-------|-------------|------------------|
| Frontend | React 18, Vite, TanStack Query, Tailwind CSS, React Router | Responsive UI, client-side routing, server state caching |
| Backend | Node.js, Express.js, Zod, Bcrypt | API routes, request validation, business logic, RBAC |
| Database | PostgreSQL 16, Prisma ORM | Relational persistence, migrations, type-safe queries |
| Architecture | npm workspaces, MVC, Outbox Event Pattern | Monorepo structure, modular backend layers, reliable async jobs |

## System Architecture

```
HTTP Request → Routes & Middleware → Controllers → Services → Repositories → Prisma ORM → PostgreSQL 16
                                                       ↓
                                                Event Dispatcher → Outbox Pattern → Background Handlers
                                                                                      ↓
                                                                           Notifications / Emails / Logs
```

- **Request Processing:** Routes handle validation and middleware (auth, rate limiting). Controllers direct requests to Services containing core business logic. Repositories abstract Prisma ORM calls.

- **Event-Driven Side Effects:** Business actions emit domain events to an Outbox table. Background workers asynchronously process these events to trigger email delivery, notifications, and activity logging without blocking the main execution path.

## Database Architecture

Powered by PostgreSQL 16 and managed via Prisma ORM, the relational schema enforces foreign key constraints and cascade deletes across five key domains:

- **User Management:** Users, active sessions, email verification, and password reset tokens.

- **Workspace System:** Multi-tenant workspaces with role-based memberships (`OWNER`, `ADMIN`, `PROJECT_MANAGER`, `MEMBER`) and invitation tracking.

- **Project & Task System:** Projects, role-based project access, Kanban tasks (`STATUS`, `PRIORITY`, `POSITION`), and task comments.

- **Notifications & Auditing:** In-app notifications and workspace-wide activity logs.

- **Event System:** Transactional outbox events and reminder tracking for background execution.

## Security & API Design

- **Auth & Session Safety:** HTTP-only SameSite session cookies, bcrypt password hashing, and token-based account flows.

- **Defensive Controls:** Rate limiting, Helmet security headers, Zod input validation, and ORM-managed SQL injection prevention.

- **Core API Surface:** RESTful endpoints organized under `/auth`, `/workspaces`, `/projects`, `/tasks`, `/comments`, and `/notifications`.

## Development Workflow

```bash
# Setup & Database
npm install && npx prisma migrate dev && npx prisma db seed

# Development (API: :4000 | Web: :5173)
npm run dev:api
npm run dev:web

# Build & Test
npm run test && npm run build
```
