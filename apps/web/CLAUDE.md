# CLAUDE.md - Web App

This file provides guidance to Claude Code (claude.ai/code) when working with the HifzHub Next.js web application.

## Overview

The web application serves as the primary interface for teachers and administrators to manage Hifz programs. It provides a desktop-optimized experience for data entry, reporting, and program management.

**Primary Users:** Teachers, Teaching Assistants, Admins, Parents (secondary)  
**Key Use Cases:** Session recording, class management, progress analytics, parent communication

## Development Commands

```bash
# From root directory
turbo run dev --filter=web      # Start dev server (http://localhost:3000)
turbo run build --filter=web    # Build for production
turbo run lint --filter=web     # Run ESLint
turbo run typecheck --filter=web # Type check

# From apps/web directory
pnpm dev                        # Start dev server
pnpm build                      # Build for production
pnpm start                      # Start production server
pnpm lint                       # Run ESLint
pnpm typecheck                  # Run TypeScript compiler
```

## Architecture

### Framework Stack
- **Next.js 16**: App Router with React Server Components
- **React 19**: Latest React with improved concurrent features
- **TypeScript 5**: Strict mode enabled
- **Tailwind CSS 4**: Utility-first styling via PostCSS
- **Shadcn UI**: Component library built on Radix UI

### Authentication
- **NextAuth.js v5 (Auth.js)**: Session-based authentication
- **Credentials Provider**: Email/password authentication
- **Database Sessions**: Stored in PostgreSQL via Prisma adapter
- **Protected Routes**: Middleware-based route protection

### API Layer
- **tRPC v11**: Type-safe API client
- **React Query**: Server state management
- **Server Actions**: For mutations in Server Components (when appropriate)

### Database Access
- **Drizzle ORM**: Type-safe SQL queries
- **Server Components**: Direct database queries for read operations
- **tRPC Procedures**: For mutations and client-side queries

## Directory Structure

```
apps/web/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (public)
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── register/
│   │       └── page.tsx          # Registration page
│   │
│   ├── (dashboard)/              # Dashboard route group (protected)
│   │   ├── layout.tsx            # Dashboard layout (sidebar, nav)
│   │   ├── page.tsx              # Dashboard home
│   │   │
│   │   ├── classes/              # Class management
│   │   │   ├── page.tsx          # Class list
│   │   │   ├── [classId]/
│   │   │   │   ├── page.tsx      # Class detail
│   │   │   │   └── students/
│   │   │   │       └── [studentId]/
│   │   │   │           └── page.tsx  # Student detail
│   │   │   └── new/
│   │   │       └── page.tsx      # Create class
│   │   │
│   │   ├── sessions/             # Session management
│   │   │   ├── page.tsx          # Session list
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Record new session
│   │   │   └── [sessionId]/
│   │   │       └── page.tsx      # Session detail
│   │   │
│   │   ├── students/             # Student management
│   │   │   ├── page.tsx          # All students
│   │   │   └── [studentId]/
│   │   │       └── page.tsx      # Student profile
│   │   │
│   │   ├── analytics/            # Reports and analytics
│   │   │   └── page.tsx          # Analytics dashboard
│   │   │
│   │   └── settings/             # User settings
│   │       └── page.tsx
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts      # NextAuth handlers
│   │   │
│   │   └── trpc/
│   │       └── [trpc]/
│   │           └── route.ts      # tRPC HTTP handler
│   │
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home/landing page
│   ├── globals.css               # Global styles + Tailwind
│   └── providers.tsx             # Client-side providers
│
├── components/
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   ├── layout/                   # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── nav.tsx
│   │   └── footer.tsx
│   │
│   ├── forms/                    # Form components
│   │   ├── session-form.tsx
│   │   ├── assignment-form.tsx
│   │   ├── student-form.tsx
│   │   └── class-form.tsx
│   │
│   ├── sessions/                 # Session-specific components
│   │   ├── session-card.tsx
│   │   ├── session-list.tsx
│   │   ├── attendance-toggle.tsx
│   │   ├── mistake-counter.tsx
│   │   └── assignment-inputs.tsx
│   │
│   ├── students/                 # Student-specific components
│   │   ├── student-card.tsx
│   │   ├── student-list.tsx
│   │   ├── progress-chart.tsx
│   │   └── assignment-status.tsx
│   │
│   ├── quran/                    # Quran viewer components
│   │   ├── quran-viewer.tsx
│   │   ├── surah-selector.tsx
│   │   ├── ayah-range-picker.tsx
│   │   └── audio-player.tsx
│   │
│   └── analytics/                # Analytics components
│       ├── stats-card.tsx
│       ├── attendance-chart.tsx
│       └── progress-report.tsx
│
├── lib/
│   ├── trpc/
│   │   ├── client.ts             # tRPC React Query client
│   │   ├── server.ts             # tRPC server-side caller
│   │   └── provider.tsx          # tRPC Provider component
│   │
│   ├── auth/
│   │   ├── config.ts             # NextAuth configuration
│   │   ├── options.ts            # Auth options
│   │   └── utils.ts              # Auth helper functions
│   │
│   ├── db.ts                     # Prisma client singleton
│   ├── utils.ts                  # General utilities
│   └── constants.ts              # App constants
│
├── hooks/
│   ├── use-user.ts               # Get current user
│   ├── use-session.ts            # Session management
│   ├── use-toast.ts              # Toast notifications
│   └── use-media-query.ts        # Responsive utilities
│
├── types/
│   ├── next-auth.d.ts            # NextAuth type extensions
│   └── index.ts                  # Additional types
│
├── middleware.ts                 # Route protection middleware
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.mjs            # PostCSS configuration
└── CLAUDE.md                     # This file
```

## Key Features & Implementation

### 1. Authentication Flow

**NextAuth.js Configuration** (`lib/auth/config.ts`):
```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@hifzhub/database';
import { users } from '@hifzhub/database/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from './utils';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      authorize: async (credentials) => {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);
        
        if (!user || !await verifyPassword(credentials.password as string, user.passwordHash!)) {
          return null;
        }
        
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role as string;
      return session;
    },
  },
});
```

**Protected Route Middleware** (`middleware.ts`):
```typescript
import { auth } from './lib/auth/config';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login');
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');

  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 2. tRPC Integration

**tRPC Client Setup** (`lib/trpc/client.ts`):
```typescript
'use client';

import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '@hifzhub/api';

export const api = createTRPCReact<AppRouter>();
```

**tRPC Provider** (`lib/trpc/provider.tsx`):
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { api } from './client';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/trpc`,
        }),
      ],
    })
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </api.Provider>
  );
}
```

**Server-side tRPC** (`lib/trpc/server.ts`):
```typescript
import { createCaller } from '@hifzhub/api';
import { db } from '@hifzhub/database';
import { auth } from '@/lib/auth/config';

export const api = createCaller({
  db,
  user: await auth(),
});
```

**Usage in Server Components**:
```typescript
// app/(dashboard)/classes/page.tsx
import { api } from '@/lib/trpc/server';

export default async function ClassesPage() {
  const classes = await api.class.getAll();
  
  return (
    <div>
      {classes.map(cls => (
        <ClassCard key={cls.id} class={cls} />
      ))}
    </div>
  );
}
```

**Usage in Client Components**:
```typescript
'use client';

import { api } from '@/lib/trpc/client';

export function CreateClassForm() {
  const createClass = api.class.create.useMutation({
    onSuccess: () => {
      router.push('/dashboard/classes');
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      createClass.mutate({ name: '...' });
    }}>
      {/* form fields */}
    </form>
  );
}
```

### 3. Session Recording Interface

**Session Form Component** (`components/forms/session-form.tsx`):
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sessionSchema } from '@hifzhub/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AttendanceToggle } from '@/components/sessions/attendance-toggle';
import { MistakeCounter } from '@/components/sessions/mistake-counter';
import { AssignmentInputs } from '@/components/sessions/assignment-inputs';

export function SessionForm({ studentId, onSuccess }) {
  const { register, handleSubmit, watch, setValue } = useForm({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      studentId,
      attendance: 'PRESENT',
      mistakes: 0,
      assignments: [],
    },
  });

  const createSession = api.session.create.useMutation({ onSuccess });

  return (
    <form onSubmit={handleSubmit((data) => createSession.mutate(data))} className="space-y-6">
      {/* Student Info Header */}
      <div className="bg-card p-4 rounded-lg">
        <h2 className="text-xl font-semibold">{student.name}</h2>
        <p className="text-muted-foreground">{student.class.name}</p>
      </div>

      {/* Attendance */}
      <AttendanceToggle
        value={watch('attendance')}
        onChange={(value) => setValue('attendance', value)}
      />

      {/* Assignments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Assignments</h3>
        <AssignmentInputs
          types={['NEW_LESSON', 'NEAREST_REVIEW', 'GENERAL_REVIEW']}
          onChange={(assignments) => setValue('assignments', assignments)}
        />
      </div>

      {/* Mistakes */}
      <MistakeCounter
        value={watch('mistakes')}
        onChange={(value) => setValue('mistakes', value)}
      />

      {/* Notes */}
      <Textarea
        {...register('notes')}
        placeholder="Session notes..."
        rows={4}
      />

      <Button type="submit" disabled={createSession.isPending}>
        {createSession.isPending ? 'Saving...' : 'Save Session'}
      </Button>
    </form>
  );
}
```

### 4. Dashboard Layout

**Dashboard Layout** (`app/(dashboard)/layout.tsx`):
```typescript
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={session.user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 5. Analytics Dashboard

**Analytics Page** (`app/(dashboard)/analytics/page.tsx`):
```typescript
import { api } from '@/lib/trpc/server';
import { StatsCard } from '@/components/analytics/stats-card';
import { AttendanceChart } from '@/components/analytics/attendance-chart';
import { ProgressReport } from '@/components/analytics/progress-report';

export default async function AnalyticsPage() {
  const stats = await api.analytics.getStats();
  const attendance = await api.analytics.getAttendance({ period: 'month' });
  const progress = await api.analytics.getProgress();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value={stats.totalStudents} />
        <StatsCard title="Active Classes" value={stats.activeClasses} />
        <StatsCard title="Avg Attendance" value={`${stats.avgAttendance}%`} />
        <StatsCard title="Pages Memorized" value={stats.totalPages} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart data={attendance} />
        <ProgressReport data={progress} />
      </div>
    </div>
  );
}
```

## Styling with Tailwind + Shadcn

### Tailwind Configuration (`tailwind.config.ts`):
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... Shadcn color tokens
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### Using Shadcn Components:
```bash
# Install Shadcn component
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

## Data Fetching Patterns

### Server Components (Preferred for reads):
```typescript
// Direct database access with Drizzle
import { db } from '@hifzhub/database';
import { students } from '@hifzhub/database/schema';

export default async function Page() {
  const allStudents = await db.select().from(students);
  return <StudentList students={allStudents} />;
}
```

### Client Components (For interactions):
```typescript
'use client';

import { api } from '@/lib/trpc/client';

export function StudentList() {
  const { data, isLoading } = api.student.getAll.useQuery();
  
  if (isLoading) return <Spinner />;
  
  return <ul>{data.map(s => <li key={s.id}>{s.name}</li>)}</ul>;
}
```

### Mutations:
```typescript
'use client';

export function DeleteStudentButton({ studentId }) {
  const utils = api.useUtils();
  const deleteStudent = api.student.delete.useMutation({
    onSuccess: () => {
      utils.student.getAll.invalidate();
    },
  });

  return (
    <Button
      onClick={() => deleteStudent.mutate({ id: studentId })}
      variant="destructive"
    >
      Delete
    </Button>
  );
}
```

## Performance Optimizations

### Route Caching:
- Static pages cached automatically
- Dynamic routes use `revalidate` or `dynamic = 'force-dynamic'`
- Use `unstable_cache` for expensive server-side computations

### Image Optimization:
```typescript
import Image from 'next/image';

<Image
  src="/student-avatar.jpg"
  alt="Student"
  width={100}
  height={100}
  className="rounded-full"
/>
```

### Font Optimization:
```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

## Environment Variables

**Required in `.env.local`:**
```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# tRPC
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Testing

```bash
# Unit tests
pnpm test

# E2E tests (Playwright)
pnpm test:e2e

# Type checking
pnpm typecheck
```

## Deployment (Vercel)

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set build command: `turbo run build --filter=web`
4. Set output directory: `apps/web/.next`
5. Deploy automatically on push to `main`

## Best Practices

1. **Use Server Components by default** - Only add `'use client'` when needed
2. **Collocate data fetching** - Fetch data where it's used
3. **Type everything** - Leverage TypeScript and tRPC for full type safety
4. **Use Shadcn components** - Don't build UI primitives from scratch
5. **Optimize images** - Always use `next/image`
6. **Handle loading states** - Show skeletons/spinners for async operations
7. **Validate inputs** - Use Zod schemas from `@hifzhub/validators`
8. **Error boundaries** - Use `error.tsx` files for error handling
9. **Accessibility** - Use semantic HTML and ARIA attributes
10. **Mobile responsive** - Test on various screen sizes

## Common Patterns

### Protected API Route:
```typescript
// app/api/some-route/route.ts
import { auth } from '@/lib/auth/config';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... handle request
}
```

### Form with Server Action:
```typescript
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createStudent(formData: FormData) {
  const name = formData.get('name');
  // ... create student
  revalidatePath('/dashboard/students');
}

// In component
<form action={createStudent}>
  <input name="name" />
  <button type="submit">Create</button>
</form>
```

### Dynamic Metadata:
```typescript
export async function generateMetadata({ params }) {
  const student = await getStudent(params.id);
  return {
    title: `${student.name} - HifzHub`,
  };
}
```

## Troubleshooting

**tRPC types not updating:**
```bash
turbo run build --filter=@hifzhub/api
```

**Drizzle types out of sync:**
```bash
pnpm db:generate
```

**Build errors:**
```bash
pnpm clean
pnpm install
turbo run build
```

**Hot reload not working:**
- Restart dev server
- Clear `.next` folder
- Check for TypeScript errors

For additional guidance, see the root `CLAUDE.md` file.