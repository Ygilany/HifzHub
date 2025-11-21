# CLAUDE.md - Web App

This file provides guidance to Claude Code (claude.ai/code) when working with the Next.js web application.

## Development Commands

```bash
# From root directory
turbo run dev --filter=web      # Start dev server
turbo run build --filter=web    # Build for production
turbo run lint --filter=web     # Run ESLint

# From apps/web directory
pnpm dev                        # Start dev server (http://localhost:3000)
pnpm build                      # Build for production
pnpm start                      # Start production server
pnpm lint                       # Run ESLint
```

## Architecture

### Framework Stack
- **Next.js 16**: Latest version with App Router
- **React 19**: Latest React with improved server components
- **TypeScript 5**: Full type safety
- **Tailwind CSS 4**: Utility-first CSS with PostCSS

### Routing
- **App Router**: File-based routing in `app/` directory
- **Layout**: Root layout in `app/layout.tsx` defines page structure
- **Pages**: Each `page.tsx` file becomes a route
- **Route organization**:
  - `app/page.tsx` → `/` (home)
  - `app/about/page.tsx` → `/about`
  - `app/blog/[slug]/page.tsx` → `/blog/:slug` (dynamic routes)

### Styling Approach
- **Tailwind CSS 4**: Used for all styling
- **PostCSS**: Configured via `postcss.config.mjs`
- **Global styles**: Defined in `app/globals.css`
- Tailwind classes applied directly to components

### Configuration Files
- `next.config.ts`: Next.js configuration
- `tsconfig.json`: TypeScript compiler options
- `postcss.config.mjs`: PostCSS and Tailwind setup
- `eslint.config.mjs`: ESLint rules (Next.js preset)

### Build Output
- `.next/`: Development and production builds
- Static assets optimized automatically by Next.js
- Images optimized via `next/image` component

## Key Next.js Patterns

### Server vs Client Components
- By default, all components in App Router are **Server Components**
- Use `'use client'` directive only when needed (state, effects, browser APIs)
- Server Components can async/await data directly

### Data Fetching
- Fetch data directly in Server Components (async functions)
- Use `fetch()` with Next.js automatic caching
- Client-side fetching with SWR or React Query if needed

### Metadata
- Export `metadata` object from pages for SEO
- Dynamic metadata via `generateMetadata()` function
