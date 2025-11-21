# CLAUDE.md - HifzHub Monorepo

This file provides guidance to Claude Code (claude.ai/code) when working with the HifzHub codebase.

## Project Overview

**HifzHub** is a comprehensive Quran Hifz (memorization) management platform that helps teachers manage their programs, track student progress, and facilitate communication between teachers, students, and parents.

### Core Features
- **Teacher Tools**: Record sessions, track attendance, assign work (new lesson/nearest review/review), log mistakes, add notes
- **Student Portal**: View assignments, mark completion, access Quran text with teacher annotations, track progress
- **Parent Dashboard**: Monitor children's progress, view teacher notes, acknowledge assignments
- **Quran Viewer**: Display Quran text with teacher markups, audio recitation, navigation

### User Roles
- **Teachers**: Primary users who manage classes and record sessions
- **Teaching Assistants**: Can record sessions but not modify student records
- **Students**: View assignments and track their own progress
- **Parents**: Monitor their children's progress and communicate with teachers
- **Admins**: Manage programs, classes, and users (future phase)

## Monorepo Architecture

### Technology Stack

**Monorepo Management:**
- **Turborepo**: Task orchestration and caching
- **pnpm**: Package manager with workspaces
- **TypeScript**: Shared types across all packages

**Database & API:**
- **PostgreSQL**: Primary database
- **Drizzle ORM**: Lightweight, type-safe SQL toolkit
- **tRPC v11**: End-to-end type-safe API layer
- **Zod**: Runtime validation schemas

**Authentication:**
- **NextAuth.js v5 (Auth.js)**: Web authentication with Drizzle adapter
- **Custom auth flow**: Mobile app with secure token storage

**Frontend Frameworks:**
- **Next.js 16** (App Router): Web application
- **React Native + Expo**: Mobile application
- **React 19**: Shared across both platforms

**Styling:**
- **Tailwind CSS**: Web styling
- **NativeWind v4**: Tailwind for React Native
- **React Native Reusables**: Pre-built accessible mobile components
- **Shadcn UI**: Web component library

## Repository Structure

```
hifzhub-monorepo/
├── apps/
│   ├── web/                 # Next.js web app + API routes
│   │   ├── app/             # App router pages
│   │   ├── components/      # Web-specific components
│   │   ├── lib/             # Utilities, tRPC client
│   │   └── CLAUDE.md        # Web-specific guidance
│   │
│   └── mobile/              # Expo mobile app
│       ├── app/             # Expo router pages
│       ├── components/      # Mobile-specific components
│       ├── lib/             # Utilities, tRPC client
│       └── CLAUDE.md        # Mobile-specific guidance
│
├── packages/
│   ├── database/            # Drizzle schema and client
│   │   ├── drizzle/
│   │   │   └── migrations/  # SQL migrations
│   │   ├── src/
│   │   │   ├── schema/      # Table schemas
│   │   │   │   ├── users.ts
│   │   │   │   ├── classes.ts
│   │   │   │   ├── sessions.ts
│   │   │   │   └── index.ts
│   │   │   ├── client.ts    # Drizzle client instance
│   │   │   └── index.ts     # Exports
│   │   ├── drizzle.config.ts
│   │   └── CLAUDE.md
│   │
│   ├── api/                 # tRPC API definitions
│   │   ├── src/
│   │   │   ├── root.ts      # Root router
│   │   │   ├── trpc.ts      # tRPC setup
│   │   │   ├── context.ts   # Request context
│   │   │   └── routers/     # Feature routers
│   │   │       ├── auth.ts
│   │   │       ├── teacher.ts
│   │   │       ├── student.ts
│   │   │       ├── session.ts
│   │   │       ├── assignment.ts
│   │   │       └── quran.ts
│   │   └── CLAUDE.md
│   │
│   ├── validators/          # Shared Zod schemas
│   │   └── src/
│   │       ├── auth.ts
│   │       ├── session.ts
│   │       └── assignment.ts
│   │
│   ├── types/               # Shared TypeScript types
│   │   └── src/
│   │       └── index.ts
│   │
│   ├── ui/                  # Shared UI components
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── card.tsx
│   │   └── CLAUDE.md
│   │
│   ├── config/              # Shared configs
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   │
│   └── utils/               # Shared utilities
│       └── src/
│           ├── date.ts
│           ├── quran.ts
│           └── formatting.ts
│
├── turbo.json               # Turborepo pipeline config
├── pnpm-workspace.yaml      # pnpm workspace config
├── package.json             # Root package.json
└── CLAUDE.md                # This file
```

## Requirements

- **Node.js**: >= 18.0.0
- **pnpm**: 9.0.0+ (enforced via `packageManager` field)
- **PostgreSQL**: 14+ (local or hosted on Supabase/Neon/Railway)
- **Docker** (optional): For local PostgreSQL development

## Quick Start

### Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd hifzhub-monorepo

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Generate Drizzle client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed database with sample data (optional)
pnpm db:seed
```

### Development Workflow

```bash
pnpm dev # Run all apps in development mode

# Run specific app
turbo run dev --filter=web      # Web app only
turbo run dev --filter=mobile   # Mobile app only

pnpm build # Build all apps

pnpm test # Run tests

pnpm lint # Lint all code

pnpm typecheck # Type check all code

pnpm format # Format code
```

## Turborepo Commands

### Global Commands (from root)

```bash
# Development
pnpm dev                    # Start all dev servers
pnpm build                  # Build all apps and packages
pnpm lint                   # Lint everything
pnpm typecheck              # Type check everything
pnpm clean                  # Clean all build artifacts

# Database operations (via packages/database)
pnpm db:generate            # Generate Drizzle types
pnpm db:migrate             # Run migrations
pnpm db:push                # Push schema changes (dev)
pnpm db:studio              # Open Drizzle Studio
pnpm db:seed                # Seed database

# Testing
pnpm test                   # Run all tests
pnpm test:watch             # Run tests in watch mode
```

### Filtered Commands

```bash
# Run task for specific workspace
turbo run dev --filter=web
turbo run build --filter=mobile
turbo run lint --filter=@hifzhub/api

# Run task for workspace and dependencies
turbo run build --filter=web...

# Run task for workspace and dependents
turbo run test --filter=...@hifzhub/database

# Multiple filters
turbo run lint --filter=web --filter=mobile
turbo run build --filter=!mobile  # Everything except mobile
```

### Mobile-Specific Commands

```bash
# From root
pnpm mobile:dev             # Start Expo dev server
pnpm mobile:android         # Run on Android
pnpm mobile:ios             # Run on iOS
pnpm mobile:web             # Run in browser

# Or with turbo
turbo run android --filter=mobile
turbo run ios --filter=mobile
```

## Database Schema (Drizzle)

### Core Tables

```typescript
// packages/database/src/schema/users.ts
import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const roleEnum = pgEnum('role', ['ADMIN', 'TEACHER', 'ASSISTANT', 'STUDENT', 'PARENT']);

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash'),
  role: roleEnum('role').notNull(),
  image: text('image'),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// packages/database/src/schema/programs.ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const programs = pgTable('programs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

export const classes = pgTable('classes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  programId: text('program_id').notNull().references(() => programs.id),
  schedule: text('schedule'), // JSON string
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

// packages/database/src/schema/profiles.ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users';
import { classes } from './programs';

export const teachers = pgTable('teachers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().unique().references(() => users.id),
});

export const students = pgTable('students', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().unique().references(() => users.id),
  classId: text('class_id').notNull().references(() => classes.id),
  enrolledAt: timestamp('enrolled_at', { mode: 'date' }).notNull().defaultNow(),
});

export const parents = pgTable('parents', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().unique().references(() => users.id),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

// packages/database/src/schema/sessions.ts
import { pgTable, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { students } from './profiles';
import { teachers } from './profiles';

export const attendanceEnum = pgEnum('attendance', ['PRESENT', 'ABSENT', 'EXCUSED', 'LATE']);

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  date: timestamp('date', { mode: 'date' }).notNull().defaultNow(),
  studentId: text('student_id').notNull().references(() => students.id),
  teacherId: text('teacher_id').notNull().references(() => teachers.id),
  attendance: attendanceEnum('attendance').notNull(),
  notes: text('notes'),
  duration: integer('duration'), // minutes
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// packages/database/src/schema/assignments.ts
import { pgTable, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { sessions } from './sessions';
import { students } from './profiles';

export const assignmentTypeEnum = pgEnum('assignment_type', [
  'NEW_LESSON',      // Sabaq Jadeed: New memorization
  'NEAREST_REVIEW',  // Sabaq Para: Recent review
  'GENERAL_REVIEW',  // Manzil: Older material
]);

export const assignmentStatusEnum = pgEnum('assignment_status', [
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'NEEDS_REVIEW',
]);

export const assignments = pgTable('assignments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  studentId: text('student_id').notNull().references(() => students.id),
  type: assignmentTypeEnum('type').notNull(),
  surah: integer('surah').notNull(), // 1-114
  ayahStart: integer('ayah_start').notNull(),
  ayahEnd: integer('ayah_end').notNull(),
  pageNumber: integer('page_number'),
  juzNumber: integer('juz_number'),
  status: assignmentStatusEnum('status').notNull().default('ASSIGNED'),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  dueDate: timestamp('due_date', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// packages/database/src/schema/mistakes.ts
import { pgTable, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { sessions } from './sessions';

export const mistakeTypeEnum = pgEnum('mistake_type', [
  'TAJWEED',
  'PRONUNCIATION',
  'SKIPPED_AYAH',
  'WORD_SUBSTITUTION',
  'HESITATION',
  'OTHER',
]);

export const severityEnum = pgEnum('severity', ['MINOR', 'MAJOR']);

export const mistakes = pgTable('mistakes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  type: mistakeTypeEnum('type').notNull(),
  surah: integer('surah').notNull(),
  ayah: integer('ayah').notNull(),
  description: text('description'),
  severity: severityEnum('severity').notNull().default('MINOR'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

// packages/database/src/schema/annotations.ts
import { pgTable, text, timestamp, integer, json } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const annotations = pgTable('annotations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  studentId: text('student_id').notNull(),
  teacherId: text('teacher_id').notNull(),
  surah: integer('surah').notNull(),
  ayah: integer('ayah').notNull(),
  type: text('type').notNull(), // "highlight", "circle", "note"
  color: text('color'),
  note: text('note'),
  coordinates: json('coordinates'), // {x, y, width, height}
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});
```

### Relations

```typescript
// packages/database/src/schema/relations.ts
import { relations } from 'drizzle-orm';
import { users, teachers, students, parents } from './users';
import { programs, classes } from './programs';
import { sessions, assignments, mistakes } from './sessions';

export const usersRelations = relations(users, ({ one }) => ({
  teacher: one(teachers, { fields: [users.id], references: [teachers.userId] }),
  student: one(students, { fields: [users.id], references: [students.userId] }),
  parent: one(parents, { fields: [users.id], references: [parents.userId] }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  class: one(classes, { fields: [students.classId], references: [classes.id] }),
  sessions: many(sessions),
  assignments: many(assignments),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  student: one(students, { fields: [sessions.studentId], references: [students.id] }),
  teacher: one(teachers, { fields: [sessions.teacherId], references: [teachers.id] }),
  assignments: many(assignments),
  mistakes: many(mistakes),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  session: one(sessions, { fields: [assignments.sessionId], references: [sessions.id] }),
  student: one(students, { fields: [assignments.studentId], references: [students.id] }),
}));
```

## Development Patterns

### tRPC API Structure

All API logic lives in `packages/api/src/routers/`. Each router handles a specific domain:

```typescript
// packages/api/src/routers/session.ts
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { sessions, assignments } from '@hifzhub/database/schema';
import { eq, desc } from 'drizzle-orm';

export const sessionRouter = router({
  // Create new session
  create: protectedProcedure
    .input(z.object({
      studentId: z.string(),
      attendance: z.enum(['PRESENT', 'ABSENT', 'EXCUSED', 'LATE']),
      notes: z.string().optional(),
      duration: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [session] = await ctx.db
        .insert(sessions)
        .values({
          ...input,
          teacherId: ctx.user.id,
        })
        .returning();
      
      return session;
    }),

  // Get recent sessions for student
  getByStudent: protectedProcedure
    .input(z.object({
      studentId: z.string(),
      limit: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(sessions)
        .where(eq(sessions.studentId, input.studentId))
        .orderBy(desc(sessions.date))
        .limit(input.limit);
    }),
});
```

### Using tRPC in Web App

```typescript
// apps/web/app/dashboard/page.tsx
import { api } from '@/lib/trpc/server';

export default async function DashboardPage() {
  const sessions = await api.session.getRecent.query({ limit: 5 });
  
  return (
    <div>
      {sessions.map(session => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
```

### Using tRPC in Mobile App

```typescript
// apps/mobile/app/(teacher)/sessions/new.tsx
import { api } from '@/lib/trpc';
import { useMutation } from '@tanstack/react-query';

export default function NewSessionScreen() {
  const createSession = api.session.create.useMutation({
    onSuccess: () => {
      router.back();
    },
  });

  const handleSubmit = (data) => {
    createSession.mutate(data);
  };

  return <SessionForm onSubmit={handleSubmit} />;
}
```

### Shared Component Pattern

```typescript
// packages/ui/src/button.tsx
import { Pressable, Text } from 'react-native';
// For web, could import from 'react' instead

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onPress, children, variant = 'primary' }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded-lg ${
        variant === 'primary' ? 'bg-blue-600' : 'bg-gray-600'
      }`}
    >
      <Text className="text-white font-semibold">{children}</Text>
    </Pressable>
  );
}
```

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hifzhub"

# NextAuth.js (Web)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# API URLs
NEXT_PUBLIC_API_URL="http://localhost:3000/api/trpc"
EXPO_PUBLIC_API_URL="http://localhost:3000/api/trpc"

# Expo
EXPO_PUBLIC_APP_SCHEME="hifzhub"
```

### Per-App .env Files

- `apps/web/.env.local` - Web-specific variables
- `apps/mobile/.env` - Mobile-specific variables (committed to repo for Expo)
- `packages/database/.env` - Database connection for Prisma CLI

## MVP Development Phases

### Phase 1: Foundation (Current)
- [x] Monorepo setup with Turborepo
- [x] Next.js web app boilerplate
- [x] Expo mobile app boilerplate
- [ ] Drizzle schema definition
- [ ] tRPC API setup
- [ ] Authentication (NextAuth.js with Drizzle adapter)

### Phase 2: Teacher Core Features
- [ ] Teacher dashboard
- [ ] Class roster view
- [ ] Session recording screen
- [ ] Student detail view
- [ ] Assignment creation

### Phase 3: Student Features
- [ ] Student dashboard
- [ ] Assignment viewer
- [ ] Progress tracking
- [ ] Basic Quran text viewer

### Phase 4: Parent Portal
- [ ] Parent dashboard
- [ ] Progress monitoring
- [ ] Teacher notes view
- [ ] Assignment acknowledgment

### Phase 5: Enhanced Quran Viewer
- [ ] Teacher annotations/markups
- [ ] Audio recitation integration
- [ ] Multiple Mushaf styles
- [ ] Practice mode

## Testing Strategy

```bash
# Unit tests (Vitest)
pnpm test

# E2E tests (Playwright for web, Detox for mobile)
pnpm test:e2e

# Type checking
pnpm typecheck
```

## Deployment

### Web (Vercel)
- Automatic deployments from `main` branch
- Preview deployments for PRs
- Environment variables configured in Vercel dashboard

### Mobile (Expo EAS)
```bash
# Build for iOS
pnpm mobile:build:ios

# Build for Android
pnpm mobile:build:android

# Submit to stores
pnpm mobile:submit
```

### Database (Production)
- Hosted on Supabase/Neon/Railway
- Migrations run via `pnpm db:migrate`
- Regular backups configured

## Code Style & Conventions

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js + React Native presets
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Semantic commit messages
- **Naming**:
  - Components: PascalCase (`SessionCard.tsx`)
  - Files: kebab-case (`use-auth.ts`)
  - Functions: camelCase (`getUserById`)
  - Constants: UPPER_SNAKE_CASE (`MAX_MISTAKES`)

## Troubleshooting

### Common Issues

**Drizzle types not generated:**
```bash
pnpm db:generate
```

**tRPC types not updating:**
```bash
turbo run build --filter=@hifzhub/api
```

**Mobile app not connecting to API:**
- Check `EXPO_PUBLIC_API_URL` in `apps/mobile/.env`
- Use computer's local IP, not `localhost` (e.g., `http://192.168.1.5:3000`)
- Ensure web dev server is running

**Workspace dependencies not resolving:**
```bash
pnpm install
turbo run build
```

## Additional Resources

- **App-specific guidance**: See `apps/web/CLAUDE.md` and `apps/mobile/CLAUDE.md`
- **Package documentation**: Each package has its own README
- **API documentation**: See `packages/api/CLAUDE.md` (when created)
- **Drizzle docs**: https://orm.drizzle.team/docs/overview
- **tRPC docs**: https://trpc.io/docs
- **Expo docs**: https://docs.expo.dev
- **Next.js docs**: https://nextjs.org/docs
- **React Native Reusables**: https://rnr-docs.vercel.app