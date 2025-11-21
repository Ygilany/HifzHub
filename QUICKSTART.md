# HifzHub - Quick Start Guide

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Monorepo | Turborepo + pnpm | Workspace management |
| Web | Next.js 16 + React 19 | Desktop-optimized teacher interface |
| Mobile | Expo + React Native | Mobile app for teachers/students |
| Database | PostgreSQL + Drizzle ORM | Type-safe data layer |
| API | tRPC v11 | End-to-end type safety |
| Auth | NextAuth.js v5 (web), Custom (mobile) | Role-based authentication |
| Styling (Web) | Tailwind + Shadcn UI | Component library |
| Styling (Mobile) | NativeWind + React Native Reusables | Accessible mobile components |
| Validation | Zod | Runtime schema validation |

## Project Structure

```
hifzhub-monorepo/
├── apps/
│   ├── web/              # Next.js (teachers, admins)
│   └── mobile/           # Expo (teachers, students, parents)
├── packages/
│   ├── database/         # Drizzle schema + migrations
│   ├── api/              # tRPC routers
│   ├── validators/       # Zod schemas
│   ├── types/            # Shared TypeScript types
│   ├── ui/               # Shared components (optional)
│   └── config/           # ESLint, TS configs
```

## Core Commands

```bash
# Setup
pnpm install
pnpm db:generate          # Generate Drizzle types
pnpm db:migrate           # Run migrations
pnpm db:seed              # Seed sample data

# Development
pnpm dev                  # Run all apps
pnpm web                  # Web only
pnpm mobile:dev           # Mobile only

# Building
pnpm build                # Build everything
pnpm typecheck            # Type check all
pnpm lint                 # Lint all
```

## Database Schema Highlights

### Key Tables
- **users** - All user accounts with role enum
- **programs → classes** - Educational hierarchy
- **teachers, students, parents** - Role-specific profiles
- **sessions** - Teaching records with attendance
- **assignments** - Three types: NEW_LESSON, NEAREST_REVIEW, GENERAL_REVIEW
- **mistakes** - Categorized errors with severity
- **annotations** - Teacher markups on Quran text

### Enums
- **role**: ADMIN, TEACHER, ASSISTANT, STUDENT, PARENT
- **attendance**: PRESENT, ABSENT, EXCUSED, LATE
- **assignment_type**: NEW_LESSON, NEAREST_REVIEW, GENERAL_REVIEW
- **assignment_status**: ASSIGNED, IN_PROGRESS, COMPLETED, NEEDS_REVIEW
- **mistake_type**: TAJWEED, PRONUNCIATION, SKIPPED_AYAH, etc.
- **severity**: MINOR, MAJOR

## Drizzle ORM Patterns

### Schema Definition
```typescript
// packages/database/src/schema/users.ts
import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['TEACHER', 'STUDENT', 'PARENT']);

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: roleEnum('role').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});
```

### Querying
```typescript
import { db } from '@hifzhub/database';
import { users, sessions } from '@hifzhub/database/schema';
import { eq, desc } from 'drizzle-orm';

// Select
const allUsers = await db.select().from(users);

// Where + Order
const userSessions = await db
  .select()
  .from(sessions)
  .where(eq(sessions.studentId, id))
  .orderBy(desc(sessions.date))
  .limit(10);

// Insert
const [newUser] = await db
  .insert(users)
  .values({ email, name, role: 'STUDENT' })
  .returning();

// Update
await db
  .update(users)
  .set({ name: 'New Name' })
  .where(eq(users.id, id));
```

## tRPC Setup

### Router Definition
```typescript
// packages/api/src/routers/student.ts
import { router, protectedProcedure } from '../trpc';
import { students } from '@hifzhub/database/schema';
import { eq } from 'drizzle-orm';

export const studentRouter = router({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => 
      ctx.db.select().from(students).where(eq(students.id, input.id))
    ),
});
```

### Client Usage (Web)
```typescript
// Server Component
import { api } from '@/lib/trpc/server';
const students = await api.student.getAll();

// Client Component
'use client';
import { api } from '@/lib/trpc/client';
const { data } = api.student.getAll.useQuery();
```

### Client Usage (Mobile)
```typescript
import { api } from '@/lib/trpc/client';
const { data } = api.student.getById.useQuery({ id });
```

## Component Libraries

### Web (Shadcn UI)
```bash
npx shadcn-ui@latest add button card input
```

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Session Details</CardTitle>
  </CardHeader>
  <Button>Save</Button>
</Card>
```

### Mobile (React Native Reusables)
```bash
npx @react-native-reusables/cli@latest add button card input
```

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

<Card>
  <CardHeader>
    <CardTitle>Session Details</CardTitle>
  </CardHeader>
  <Button>
    <Text>Save</Text>
  </Button>
</Card>
```

## Authentication

### Web (NextAuth.js)
```typescript
// lib/auth/config.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@hifzhub/database';

export const { handlers, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [Credentials({ /* ... */ })],
});
```

### Mobile (Custom + Secure Storage)
```typescript
import * as SecureStore from 'expo-secure-store';

// Store token
await SecureStore.setItemAsync('token', token);

// Retrieve token
const token = await SecureStore.getItemAsync('token');

// Use in tRPC headers
headers: async () => ({
  authorization: `Bearer ${await SecureStore.getItemAsync('token')}`,
})
```

## Environment Variables

### Root `.env`
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/hifzhub"
```

### Web `.env.local`
```bash
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Mobile `.env`
```bash
EXPO_PUBLIC_API_URL="http://192.168.1.5:3000/api/trpc"  # Use local IP!
EXPO_PUBLIC_APP_SCHEME="hifzhub"
```

## Development Workflow

### Day-to-Day
1. Start database (Docker or hosted)
2. Run `pnpm dev` (starts web + mobile)
3. Open web at `http://localhost:3000`
4. Scan QR code in Expo Go for mobile
5. Make changes, hot reload happens automatically

### Adding Features
1. Define schema in `packages/database/src/schema/`
2. Run `pnpm db:generate` and `pnpm db:migrate`
3. Create tRPC router in `packages/api/src/routers/`
4. Create Zod validator in `packages/validators/`
5. Use in web/mobile components

### Database Changes
```bash
# 1. Edit schema files
# 2. Generate migration
pnpm db:generate

# 3. Apply migration
pnpm db:migrate

# For quick prototyping (dev only)
pnpm db:push
```

## Common Patterns

### Server-Side Data Fetching (Web)
```typescript
// app/dashboard/page.tsx
import { db } from '@hifzhub/database';
import { students } from '@hifzhub/database/schema';

export default async function DashboardPage() {
  const allStudents = await db.select().from(students);
  return <StudentList students={allStudents} />;
}
```

### Client-Side Mutations
```typescript
'use client';
import { api } from '@/lib/trpc/client';

const createStudent = api.student.create.useMutation({
  onSuccess: () => {
    router.push('/students');
  },
});

<form onSubmit={() => createStudent.mutate({ name, email })}>
```

### Mobile Forms with RNR
```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

<Input placeholder="Student name" value={name} onChangeText={setName} />
<Button onPress={handleSubmit}>
  <Text>Submit</Text>
</Button>
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Types out of sync | `pnpm db:generate` |
| Mobile can't connect | Use local IP, not `localhost` |
| Hot reload broken | Clear cache: `pnpm start --clear` |
| Build failing | `pnpm clean && pnpm install` |
| Database out of sync | `pnpm db:migrate` |

## Next Steps

1. **Review Full Docs**: Read `CLAUDE.md` in root, web, mobile
2. **Setup Database**: Create PostgreSQL database (local or hosted)
3. **Define Schema**: Complete Drizzle schema in `packages/database`
4. **Build API**: Create tRPC routers in `packages/api`
5. **Start with Auth**: Implement login flow first
6. **Teacher Features**: Build session recording (highest priority)
7. **Student Features**: Build assignment viewer
8. **Iterate**: Add features phase by phase

## Resources

- **Drizzle**: https://orm.drizzle.team/docs
- **tRPC**: https://trpc.io/docs
- **NextAuth**: https://authjs.dev
- **Expo**: https://docs.expo.dev
- **React Native Reusables**: https://rnr-docs.vercel.app
- **Shadcn**: https://ui.shadcn.com
- **NativeWind**: https://www.nativewind.dev

---

**For detailed architecture, see individual CLAUDE.md files in root, apps/web, and apps/mobile.**