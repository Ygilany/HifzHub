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

**Setup:** NextAuth.js v5 with DrizzleAdapter in `lib/auth/config.ts`
- Credentials provider with email/password
- JWT session strategy
- Role stored in JWT token and session
- Protected routes via middleware

See [NextAuth docs](https://authjs.dev) for detailed configuration patterns.

### 2. tRPC Integration

**Setup:**
- Client: `lib/trpc/client.ts` - React Query hooks for client components
- Server: `lib/trpc/server.ts` - Direct procedure calls in server components
- Provider: `lib/trpc/provider.tsx` - Wraps app with tRPC + React Query context

**Usage:**
- Server components: `const data = await api.router.procedure()`
- Client components: `const { data } = api.router.procedure.useQuery()`
- Mutations: `const mutation = api.router.procedure.useMutation()`

See [tRPC Next.js docs](https://trpc.io/docs/client/nextjs) for complete patterns.

### 3. Session Recording Interface

**Key Components:**
- `SessionForm` - Main form using React Hook Form + Zod validation
- `AttendanceToggle` - Radio group for attendance status
- `AssignmentInputs` - Dynamic inputs for 3 assignment types
- `MistakeCounter` - Increment/decrement counter
- Uses Shadcn UI components (Button, Input, Textarea, Select)

### 4. Dashboard Layout

Protected route group with shared layout:
- Sidebar navigation
- Header with user info
- Main content area with overflow scroll
- Auth check via NextAuth `auth()` function

### 5. Analytics Dashboard

Server-side data fetching for stats, charts, and reports:
- Grid layout for stat cards (total students, attendance rate, etc.)
- Charts for attendance trends and progress
- All data fetched via tRPC in server component

## Styling with Tailwind + Shadcn

- **Tailwind CSS 4**: Configured via PostCSS
- **Shadcn UI**: Add components with `npx shadcn-ui@latest add <component>`
- **Dark mode**: CSS variable-based theming with `class` strategy
- **Colors**: HSL-based design tokens (background, foreground, primary, etc.)

## Data Fetching Patterns

**Server Components (preferred for reads):**
- Direct DB access with Drizzle OR tRPC server-side caller
- Automatic request deduplication and caching

**Client Components (for interactions):**
- tRPC React Query hooks (`useQuery`, `useMutation`)
- Optimistic updates and cache invalidation

**Performance:** Use Next.js `Image`, Google Fonts optimization, route-level caching/revalidation

See [Next.js data fetching](https://nextjs.org/docs/app/building-your-application/data-fetching) for patterns.

## Environment Variables

**Required in `.env.local`:**
- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` - NextAuth config
- `NEXT_PUBLIC_API_URL` - tRPC endpoint

## Best Practices

1. Server Components by default (`'use client'` only when needed)
2. Collocate data fetching where used
3. Use Shadcn components, not custom primitives
4. Zod validation for all inputs
5. Handle loading/error states with Suspense and error boundaries
6. Optimize with Next.js `Image` and font optimization
7. Mobile-responsive design

## Common Patterns

- **Protected routes**: Middleware or `auth()` check in layout
- **Server Actions**: For form mutations with revalidation
- **Dynamic metadata**: `generateMetadata()` for SEO
- **Error handling**: `error.tsx` boundaries at route level

## Troubleshooting

| Issue | Solution |
|-------|----------|
| tRPC types stale | `turbo run build --filter=@hifzhub/api` |
| Drizzle types stale | `pnpm db:generate` |
| Hot reload broken | Delete `.next/`, restart server |
| Build failing | `pnpm clean && pnpm install && turbo build` |

See root `CLAUDE.md` for monorepo-level guidance.