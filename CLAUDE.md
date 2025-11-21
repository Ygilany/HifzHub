# CLAUDE.md - HifzHub Monorepo

This file provides guidance to Claude Code (claude.ai/code) when working with the HifzHub codebase.

## Project Overview

**HifzHub** is a Quran Hifz (memorization) management platform for teachers, students, and parents.

### Core Features
- **Teacher Tools**: Record sessions, track attendance, assign work, log mistakes
- **Student Portal**: View assignments, access Quran text with annotations, track progress
- **Parent Dashboard**: Monitor children's progress
- **Quran Viewer**: Display Quran with teacher markups and audio

### User Roles
Teachers, Teaching Assistants, Students, Parents, Admins

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

Schema located in `packages/database/src/schema/`. See [Drizzle docs](https://orm.drizzle.team/docs) for syntax.

### Core Tables
- **users** - All accounts with role enum (ADMIN, TEACHER, ASSISTANT, STUDENT, PARENT)
- **programs → classes** - Educational hierarchy
- **teachers, students, parents** - Role-specific profiles (1:1 with users)
- **sessions** - Teaching records with attendance, mistakes, notes
- **assignments** - Three types: NEW_LESSON, NEAREST_REVIEW, GENERAL_REVIEW
- **mistakes** - Categorized by type (TAJWEED, PRONUNCIATION, etc.) and severity
- **annotations** - Teacher markups on Quran text (highlights, notes, coordinates)

### Key Enums
- **attendance**: PRESENT, ABSENT, EXCUSED, LATE
- **assignment_status**: ASSIGNED, IN_PROGRESS, COMPLETED, NEEDS_REVIEW
- **mistake_type**: TAJWEED, PRONUNCIATION, SKIPPED_AYAH, WORD_SUBSTITUTION, HESITATION

### Relations
- Users have one teacher/student/parent profile
- Students belong to classes, have many sessions and assignments
- Sessions link teachers and students, contain assignments and mistakes

## Development Patterns

### tRPC API Structure
- API routers in `packages/api/src/routers/` (one per domain: auth, session, student, etc.)
- Use `protectedProcedure` for authenticated endpoints
- Input validation with Zod schemas from `@hifzhub/validators`
- See [tRPC docs](https://trpc.io/docs) for router/procedure patterns

### Using tRPC
**Web (Server Components):** Import `api` from `@/lib/trpc/server`, call procedures directly
**Web (Client Components):** Import `api` from `@/lib/trpc/client`, use React Query hooks
**Mobile:** Import `api` from `@/lib/trpc/client`, use React Query hooks

### Shared Components
Optional `packages/ui/` for cross-platform components. Use NativeWind for styling compatibility.

## Environment Variables

### Root `.env`
- `DATABASE_URL` - PostgreSQL connection string

### Web `apps/web/.env.local`
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` - NextAuth.js configuration
- `NEXT_PUBLIC_API_URL` - tRPC endpoint

### Mobile `apps/mobile/.env`
- `EXPO_PUBLIC_API_URL` - tRPC endpoint (use local IP, not localhost)
- `EXPO_PUBLIC_APP_SCHEME` - Deep linking scheme

## Development Phases

**Phase 1:** Foundation (monorepo, database, auth)
**Phase 2:** Teacher core (session recording, class management)
**Phase 3:** Student features (assignments, progress, Quran viewer)
**Phase 4:** Parent portal
**Phase 5:** Enhanced Quran viewer (annotations, audio)

## Testing & Deployment

**Testing:** `pnpm test`, `pnpm test:e2e`, `pnpm typecheck`
**Web Deploy:** Vercel (auto from `main`)
**Mobile Deploy:** EAS Build (`eas build`, `eas submit`)
**Database:** Hosted PostgreSQL with migrations via `pnpm db:migrate`

## Code Conventions

- TypeScript strict mode
- PascalCase components, camelCase functions, kebab-case files
- Conventional commits

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Drizzle types out of sync | `pnpm db:generate` |
| tRPC types not updating | `turbo run build --filter=@hifzhub/api` |
| Mobile can't connect | Use local IP in `EXPO_PUBLIC_API_URL`, not localhost |
| Workspace deps broken | `pnpm install && turbo run build` |
| Hot reload issues | `pnpm start --clear` (mobile) or delete `.next` (web) |

## Resources

- **App docs**: `apps/web/CLAUDE.md`, `apps/mobile/CLAUDE.md`
- **Quick start**: `QUICKSTART.md` for rapid onboarding
- **External**: [Drizzle](https://orm.drizzle.team), [tRPC](https://trpc.io), [Expo](https://docs.expo.dev), [Next.js](https://nextjs.org), [RNR](https://rnr-docs.vercel.app)