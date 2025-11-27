# @hifzhub/database

Database package for HifzHub using Drizzle ORM and PostgreSQL.

## Setup

### 1. Configure Database URL

Update the `DATABASE_URL` in the root `.env` file with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/hifzhub"
```

For Docker PostgreSQL, the format is typically:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/hifzhub"
```

### 2. Run Migrations

From the root of the monorepo:

```bash
# Generate migration files from schema changes
pnpm db:generate

# Run migrations to update the database
pnpm db:migrate

# Or push schema directly to database (development only)
pnpm db:push

# Open Drizzle Studio to view/edit data
pnpm db:studio
```

## Schema

The database schema is defined in `src/schema/`:

- **users.ts** - User accounts with roles (ADMIN, TEACHER, ASSISTANT, STUDENT, PARENT)

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (auto-generated) |
| email | varchar(255) | Unique email address |
| name | varchar(255) | User's full name |
| role | enum | User role (ADMIN, TEACHER, ASSISTANT, STUDENT, PARENT) |
| passwordHash | varchar(255) | Hashed password |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last update timestamp |

## Usage

Import the database client and schema:

```typescript
import { db } from "@hifzhub/database/client";
import { users } from "@hifzhub/database/schema";

// Query users
const allUsers = await db.select().from(users);

// Insert a new user
const newUser = await db.insert(users).values({
  email: "teacher@example.com",
  name: "John Doe",
  role: "TEACHER",
  passwordHash: "hashed_password_here",
});
```

## Troubleshooting

### Migration fails with authentication error

Verify your DATABASE_URL credentials match your PostgreSQL instance:

```bash
# Test connection with psql
psql "postgresql://username:password@localhost:5432/hifzhub"
```

### Schema changes not reflected

1. Generate new migration: `pnpm db:generate`
2. Run migrations: `pnpm db:migrate`

### Database connection errors

Ensure PostgreSQL is running:

```bash
# If using Docker
docker ps | grep postgres
```
