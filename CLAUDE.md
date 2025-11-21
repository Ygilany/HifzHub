# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HifzHub is a Turborepo monorepo with pnpm workspaces containing:
- **apps/web**: Next.js 16 web application (see `apps/web/CLAUDE.md`)
- **apps/mobile**: Expo mobile application (see `apps/mobile/CLAUDE.md`)

## Requirements

- **Node.js**: >= 18
- **Package Manager**: pnpm 9.0.0 (enforced via `packageManager` field)

## Turborepo Commands

### Running Tasks Across All Apps
```bash
# Run task in all workspaces
pnpm dev           # Start all dev servers
pnpm build         # Build all apps
pnpm lint          # Lint all apps
pnpm start         # Start all production servers
```

### Using Turborepo Filters

**Run task in specific app:**
```bash
turbo run dev --filter=web           # Run dev server for web app only
turbo run build --filter=mobile      # Build mobile app only
turbo run lint --filter=web          # Lint web app only
```

**Run task for app and its dependencies:**
```bash
turbo run build --filter=web...      # Build web and all its dependencies
turbo run test --filter=...mobile    # Run tests for mobile and all dependents
```

**Multiple filters:**
```bash
turbo run lint --filter=web --filter=mobile    # Lint both web and mobile
turbo run build --filter=!mobile               # Build everything except mobile
```

### Platform-Specific Commands

These commands target the mobile app:
```bash
pnpm android       # Run mobile app on Android (alias for turbo run android)
pnpm ios          # Run mobile app on iOS (alias for turbo run ios)
pnpm web          # Run mobile app in browser (alias for turbo run web)
```

## Monorepo Structure

### Workspace Configuration
- **Workspace root**: `pnpm-workspace.yaml` defines workspace pattern `apps/*`
- **Task orchestration**: `turbo.json` configures task pipelines and caching
- **Dependency management**: pnpm handles workspace dependencies and linking

### Turborepo Pipeline (`turbo.json`)

**Cached tasks:**
- `build`: Outputs to `dist/`, `.next/`, `build/`, `.expo/`
- `lint`: Depends on all dependencies being linted first

**Persistent tasks (no caching):**
- `dev`, `start`, `android`, `ios`, `web`: Development servers that must run continuously

**Task dependencies:**
- Tasks use `dependsOn: ["^build"]` pattern to ensure dependencies are built first
- `^` prefix means "dependencies' task must complete first"

### Adding New Workspaces

1. Create new directory in `apps/` or `packages/`
2. Add `package.json` with unique name
3. Run `pnpm install` to link workspace
4. Add tasks to workspace's `package.json` that match root turborepo tasks

### Working in Individual Apps

To work on a specific app, either:
1. Use Turborepo filters from root: `turbo run dev --filter=web`
2. Navigate to app directory: `cd apps/web && pnpm dev`

Each app has its own CLAUDE.md with app-specific architecture details.
