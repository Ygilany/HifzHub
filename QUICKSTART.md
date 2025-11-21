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

**Schema:** Define tables with `pgTable`, use enums, CUID2 for IDs
**Queries:** Select/where/orderBy, `.insert().values().returning()`, `.update().set().where()`

See [Drizzle docs](https://orm.drizzle.team) for full query API.

## tRPC Setup

**Routers:** Define in `packages/api/src/routers/` with `protectedProcedure` for auth
**Web usage:** `await api.router.procedure()` (server) or `api.router.procedure.useQuery()` (client)
**Mobile usage:** `api.router.procedure.useQuery()` or `.useMutation()`

See [tRPC docs](https://trpc.io) for complete API.

## Component Libraries

**Web:** Shadcn UI - `npx shadcn-ui@latest add <component>`
**Mobile:** React Native Reusables - `npx @react-native-reusables/cli@latest add <component>`

Both use similar component APIs (Button, Card, Input, etc.)

## Authentication

**Web:** NextAuth.js v5 with DrizzleAdapter, JWT sessions
**Mobile:** Custom auth with tokens in `expo-secure-store`, injected into tRPC headers

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

**Web data fetching:** Server components use direct DB access or tRPC server caller
**Client mutations:** Use tRPC `useMutation` with React Query cache invalidation
**Mobile forms:** RNR components (Input, Button) with local state management

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