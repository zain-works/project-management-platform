# Project Management Platform - Setup Guide

This guide explains how to set up and run the Project Management Platform.

## Prerequisites

- **Node.js**: v18 or higher (download from [nodejs.org](https://nodejs.org/))
- **PostgreSQL**: v16 or higher (download from [postgresql.org](https://www.postgresql.org/download/))
- **npm**: Comes with Node.js

## Installation

### 1. Clone the repository (if not already cloned)

```bash
git clone <repository-url>
cd project-management-platform
```

### 2. Install dependencies

```bash
npm install
```

This will install all dependencies for the monorepo (packages, API, and web app).

## Database Setup

### Option A: Use existing PostgreSQL installation

If you already have PostgreSQL running locally:

1. Create a database:
```bash
# Using psql
psql -U postgres
CREATE DATABASE project_management;
\q
```

2. Configure the connection in `.env` (see Environment Configuration below)

### Option B: Install PostgreSQL locally

#### Windows
1. Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer with default settings
3. Set a password for the `postgres` user (remember this password)
4. After installation, open pgAdmin or use psql to create the database:
```bash
psql -U postgres -c "CREATE DATABASE project_management;"
```

#### macOS
```bash
# Using Homebrew
brew install postgresql@16
brew services start postgresql@16
psql postgres -c "CREATE DATABASE project_management;"
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql-16 postgresql-contrib
sudo -u postgres psql -c "CREATE DATABASE project_management;"
```

## Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and configure the following:

```env
# Application Configuration
NODE_ENV=development
PORT=4000
CLIENT_ORIGIN=http://localhost:5173

# Database Configuration
# Update with your PostgreSQL credentials
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/project_management?schema=public

# Authentication & Sessions
SESSION_SECRET=change-this-to-a-random-secret-at-least-32-characters
COOKIE_SECURE=false

# Email Configuration (Optional)
# Leave empty to use the built-in dev email preview at /api/v1/dev/emails
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=notifications@projectmgmt.local
```

## Database Initialization

Run Prisma migrations to set up the database schema:

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed the database with sample data
npm run prisma:seed
```

## Running the Application

### Development Mode

#### API only:
```bash
npm run dev:api
```

#### Web frontend only:
```bash
npm run dev:web
```

#### Both API and web:
```bash
npm run dev:all
```

The API will be available at `http://localhost:4000`
The web app will be available at `http://localhost:5173`

### Production Build

```bash
# Build all packages
npm run build

# Start the API server
npm run dev:api
```

For production deployment, run:
```bash
npm run build
cd apps/api
node dist/server.js
```

## Development Workflow

### Code quality

```bash
# Run linter
npm run lint

# Run tests
npm run test
```

### Database changes

When you modify the Prisma schema (`prisma/schema.prisma`):

```bash
# Regenerate the Prisma client
npm run prisma:generate

# Push changes to the database (development only)
npm run prisma:push

# Or create a new migration
npm run prisma:migrate
```

## Troubleshooting

### Database connection errors

If you see "Database connection could not be established":
1. Verify PostgreSQL is running:
   - Windows: Check Services for "postgresql-x64-16"
   - macOS/Linux: `brew services list` or `systemctl status postgresql`
2. Verify the DATABASE_URL in `.env` matches your PostgreSQL credentials
3. Verify the database `project_management` exists

### Port already in use

If port 4000 or 5173 is already in use:
1. Change the PORT in `.env` for the API
2. Change the port in `apps/web/vite.config.ts` for the web app

### Prisma client not found

If you get errors about Prisma client:
```bash
npm run prisma:generate
```

## Architecture

This is a monorepo with the following structure:

- `packages/shared` - Shared types and utilities
- `apps/api` - Express.js backend API
- `apps/web` - React frontend with Vite
- `prisma/` - Database schema and migrations

## Email Configuration

For development, the application includes a built-in email preview at `http://localhost:4000/api/v1/dev/emails`. No external email service is required.

For production, configure SMTP settings in `.env`:
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=notifications@yourdomain.com
```

## Additional Resources

- Prisma documentation: https://www.prisma.io/docs
- Express documentation: https://expressjs.com/
- React documentation: https://react.dev/
