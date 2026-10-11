# Project Management Platform

A production-ready project management application built with TypeScript, featuring MVC architecture and event-driven design for scalability and maintainability.

## Architecture Overview

### Technology Stack

**Backend (API)**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 16 with Prisma ORM
- **Authentication**: Session-based with bcrypt password hashing
- **Event System**: Custom event-driven architecture with outbox pattern
- **Email**: Nodemailer with built-in dev preview

**Frontend (Web)**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **Drag & Drop**: @hello-pangea/dnd for kanban boards

**Shared**
- **Validation**: Zod schemas
- **Type Safety**: Shared TypeScript types across monorepo

### Monorepo Structure

```
project-management-platform/
├── apps/
│   ├── api/              # Express.js backend API
│   │   ├── src/
│   │   │   ├── config/        # Database, environment, mailer config
│   │   │   ├── controllers/  # Request handlers (8 controllers)
│   │   │   ├── events/        # Event-driven architecture
│   │   │   │   ├── definitions/   # Event type definitions
│   │   │   │   ├── dispatcher/    # Event dispatcher
│   │   │   │   ├── handlers/      # Event handlers
│   │   │   │   └── workers/       # Background workers
│   │   │   ├── middleware/    # Express middleware
│   │   │   ├── repositories/  # Data access layer (9 repositories)
│   │   │   ├── routes/        # API route definitions
│   │   │   ├── services/      # Business logic (7 services)
│   │   │   ├── utils/         # Utilities (logger, password, etc.)
│   │   │   ├── app.ts         # Express app configuration
│   │   │   └── server.ts      # Server bootstrap
│   │   └── dist/              # Compiled JavaScript
│   └── web/              # React frontend
│       ├── src/
│       │   ├── api/           # API client layer
│       │   ├── components/    # Reusable React components
│       │   ├── context/       # React context providers
│       │   ├── pages/         # Page components
│       │   ├── App.tsx        # Root component
│       │   └── main.tsx       # Entry point
│       └── dist/              # Production build
├── packages/
│   └── shared/           # Shared types and utilities
│       └── src/
│           └── index.ts      # Shared Zod schemas and types
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   └── seed.ts           # Database seeding script
├── .env.example          # Environment variables template
├── package.json          # Root package.json
└── SETUP.md              # Setup and installation guide
```

### Backend Architecture (MVC + Event-Driven)

The backend follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Express Routes                        │
│              (API Endpoints & Routing)                  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  Controllers                            │
│         (Request/Response Handling)                     │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                   Services                               │
│            (Business Logic Layer)                        │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼─────────┐          ┌────────▼──────────┐
│  Repositories   │          │ Event Dispatcher  │
│ (Data Access)   │          │ (Async Events)    │
└───────┬─────────┘          └────────┬──────────┘
        │                             │
┌───────▼─────────┐          ┌────────▼──────────┐
│    Prisma ORM   │          │  Event Handlers   │
│  (PostgreSQL)   │          │ (Side Effects)    │
└─────────────────┘          └───────────────────┘
```

**Layer Responsibilities:**

1. **Routes** (`apps/api/src/routes/`)
   - Define API endpoints and route structure
   - Map HTTP methods to controller actions
   - Apply middleware (auth, validation, rate limiting)

2. **Controllers** (`apps/api/src/controllers/`)
   - Handle HTTP requests and responses
   - Validate input with Zod schemas
   - Call services for business logic
   - Return appropriate status codes and responses

3. **Services** (`apps/api/src/services/`)
   - Implement business logic
   - Coordinate between repositories
   - Emit domain events for side effects
   - Handle complex operations (e.g., task creation with notifications)

4. **Repositories** (`apps/api/src/repositories/`)
   - Abstract database operations
   - Provide clean data access interface
   - Use Prisma Client for queries
   - Handle CRUD operations

5. **Middleware** (`apps/api/src/middleware/`)
   - `auth.middleware.ts` - Session authentication
   - `rbac.middleware.ts` - Role-based access control
   - `validation.middleware.ts` - Request validation
   - `rateLimit.middleware.ts` - API rate limiting
   - `errorHandler.middleware.ts` - Centralized error handling

### Event-Driven Architecture

The application uses an event-driven architecture for decoupling side effects:

**Components:**

1. **Event Definitions** (`events/definitions/events.ts`)
   - Type-safe event schemas
   - Event types (TaskCreated, WorkspaceCreated, etc.)

2. **Event Dispatcher** (`events/dispatcher/`)
   - Central event bus
   - Type-safe event emission
   - Handler registration
   - Error isolation (handler failures don't break execution)

3. **Event Handlers** (`events/handlers/`)
   - React to domain events
   - Execute side effects (notifications, activity logs, emails)
   - Isolated error handling

4. **Background Workers** (`events/workers/`)
   - `OutboxWorker` - Processes outbox events for reliable delivery
   - `ReminderWorker` - Sends task due date reminders
   - Run on intervals to handle async tasks

**Benefits:**
- Decoupled business logic from side effects
- Reliable event processing with outbox pattern
- Easy to add new event handlers
- Testable components

### Database Schema

**Core Entities:**
- **User** - User accounts and authentication
- **Workspace** - Top-level organizational units
- **Project** - Projects within workspaces
- **Task** - Tasks with kanban board support
- **Comment** - Task comments
- **Notification** - User notifications
- **ActivityLog** - Audit trail of actions
- **OutboxEvent** - Event outbox for reliable delivery
- **ReminderTracking** - Reminder sent tracking

**Key Features:**
- Multi-tenancy via workspaces
- Role-based access control (OWNER, ADMIN, PROJECT_MANAGER, MEMBER)
- Task status workflow (BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, DONE)
- Task priority levels (LOW, MEDIUM, HIGH, URGENT)
- Activity logging for audit trails
- Email verification and password reset tokens

### API Endpoints

**Authentication**
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/verify-email` - Email verification
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset

**Workspaces**
- `GET /api/v1/workspaces` - List user workspaces
- `POST /api/v1/workspaces` - Create workspace
- `GET /api/v1/workspaces/:id` - Get workspace details
- `PUT /api/v1/workspaces/:id` - Update workspace
- `DELETE /api/v1/workspaces/:id` - Delete workspace
- `POST /api/v1/workspaces/:id/invite` - Invite user to workspace

**Projects**
- `GET /api/v1/projects` - List projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project
- `POST /api/v1/projects/:id/members` - Add project member

**Tasks**
- `GET /api/v1/tasks` - List tasks
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/:id` - Get task details
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task
- `PATCH /api/v1/tasks/:id/reorder` - Reorder tasks

**Comments**
- `GET /api/v1/tasks/:taskId/comments` - List task comments
- `POST /api/v1/tasks/:taskId/comments` - Add comment
- `DELETE /api/v1/comments/:id` - Delete comment

**Notifications**
- `GET /api/v1/notifications` - List user notifications
- `PATCH /api/v1/notifications/:id/read` - Mark as read
- `PATCH /api/v1/notifications/read-all` - Mark all as read

**Dashboard**
- `GET /api/v1/dashboard` - Get dashboard stats

**Health**
- `GET /api/v1/health` - Health check endpoint
- `GET /api/v1/dev/emails` - Dev email preview

### Frontend Architecture

**React App Structure:**
- `App.tsx` - Root component with routing
- `api/` - API client with TanStack Query
- `components/` - Reusable UI components
- `context/` - Context providers (auth, notifications)
- `pages/` - Page components (Dashboard, Projects, Tasks, etc.)

**Key Pages:**
- Landing page
- Authentication (Login, Signup, Forgot Password, Reset Password)
- Onboarding
- Dashboard
- Workspaces
- Projects (list and detail)
- Project Board (kanban)
- Tasks (list and detail)
- Team
- My Tasks
- Notifications
- Settings
- Profile

**State Management:**
- TanStack Query for server state
- React Context for global state (auth, notifications)
- Local state for component-specific data

## Prerequisites

- **Node.js**: v18 or higher
- **PostgreSQL**: v16 or higher
- **npm**: Comes with Node.js

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL

Install PostgreSQL 16+ on your system and create a database:

**Windows:**
1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer with default settings
3. Create database: `psql -U postgres -c "CREATE DATABASE project_management;"`

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
psql postgres -c "CREATE DATABASE project_management;"
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql-16 postgresql-contrib
sudo -u postgres psql -c "CREATE DATABASE project_management;"
```

### 3. Configure Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
NODE_ENV=development
PORT=4000
CLIENT_ORIGIN=http://localhost:5173

# Update with your PostgreSQL credentials
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/project_management?schema=public

SESSION_SECRET=change-this-to-a-random-secret-at-least-32-characters
COOKIE_SECURE=false

# Email (optional - leave empty for dev preview)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=notifications@projectmgmt.local
```

### 4. Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed with sample data
npm run prisma:seed
```

## Running the Application

### Development

**API only:**
```bash
npm run dev:api
```

**Web frontend only:**
```bash
npm run dev:web
```

**Both API and web:**
```bash
npm run dev:all
```

Access the application at:
- API: http://localhost:4000
- Web: http://localhost:5173

### Production Build

```bash
# Build all packages
npm run build

# Start API server
cd apps/api
node dist/server.js
```

## Development Workflow

### Code Quality

```bash
# Run linter
npm run lint

# Run tests
npm run test
```

### Database Changes

When modifying `prisma/schema.prisma`:

```bash
# Regenerate Prisma client
npm run prisma:generate

# Push changes (development only)
npm run prisma:push

# Or create a migration
npm run prisma:migrate
```

### Building

```bash
# Build all packages
npm run build

# Build individual packages
npm run build --workspace=@pmp/shared
npm run build --workspace=@pmp/api
npm run build --workspace=@pmp/web
```

## Email Configuration

### Development
The application includes a built-in email preview at `http://localhost:4000/api/v1/dev/emails`. No external email service is required.

### Production
Configure SMTP settings in `.env`:
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=notifications@yourdomain.com
```

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- CSRF protection via same-site cookies
- Rate limiting on API endpoints
- Security headers via Helmet
- Role-based access control
- Input validation with Zod
- SQL injection prevention via Prisma ORM

## Background Workers

The application runs background workers for:

1. **OutboxWorker** - Processes outbox events for reliable event delivery
2. **ReminderWorker** - Sends task due date reminders

Workers run automatically when the API server starts.

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database `project_management` exists

### Port Already in Use
- Change PORT in `.env` for API
- Change port in `apps/web/vite.config.ts` for web

### Prisma Client Not Found
```bash
npm run prisma:generate
```

## License

[Your License Here]
