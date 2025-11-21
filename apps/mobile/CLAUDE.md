# CLAUDE.md - Mobile App

This file provides guidance to Claude Code (claude.ai/code) when working with the HifzHub Expo mobile application.

## Overview

The mobile application provides on-the-go access for teachers and students. Teachers can quickly record sessions, while students can view assignments and track their progress.

**Primary Users:** Teachers (on-the-go), Students (primary interface), Parents  
**Key Use Cases:** Quick session recording, assignment viewing, Quran reading, progress tracking

## Development Commands

```bash
# From root directory
turbo run dev --filter=mobile       # Start Expo dev server
turbo run android --filter=mobile   # Run on Android
turbo run ios --filter=mobile       # Run on iOS
turbo run build --filter=mobile     # Create production build

# From apps/mobile directory
pnpm dev                            # Start Expo dev server
pnpm android                        # Run on Android emulator/device
pnpm ios                            # Run on iOS simulator/device
pnpm web                            # Run in web browser (for testing)
pnpm build:android                  # Build Android APK/AAB
pnpm build:ios                      # Build iOS IPA
pnpm lint                           # Run ESLint
pnpm typecheck                      # Run TypeScript compiler
```

## Architecture

### Framework Stack
- **Expo SDK 54**: Managed workflow with EAS Build
- **React Native 0.81.5**: With New Architecture enabled
- **React 19**: Latest React
- **TypeScript 5**: Strict mode enabled
- **Expo Router 6**: File-based routing and navigation

### Styling
- **NativeWind v4**: Tailwind CSS for React Native
- **React Native Reusables**: Accessible, pre-built components (based on shadcn/ui)
- **Expo System UI**: Native look and feel (iOS/Android)
- **Theme Support**: Light/dark mode via `useColorScheme`

### API Layer
- **tRPC v11**: Type-safe API client (shared with web)
- **React Query**: Data fetching and caching
- **Secure Storage**: `expo-secure-store` for tokens

### State Management
- **Zustand**: Lightweight global state
- **React Context**: For theme and auth
- **React Query**: Server state (via tRPC)

### Navigation
- **Expo Router**: File-based routing
- **Stack Navigator**: For hierarchical navigation
- **Tab Navigator**: Bottom tabs for main screens
- **Modal Presentation**: For overlays and dialogs

## Directory Structure

```
apps/mobile/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Auth route group (public)
│   │   ├── _layout.tsx           # Auth stack layout
│   │   ├── login.tsx             # Login screen
│   │   └── register.tsx          # Register screen
│   │
│   ├── (teacher)/                # Teacher route group (protected)
│   │   ├── _layout.tsx           # Teacher tabs layout
│   │   ├── index.tsx             # Teacher dashboard
│   │   ├── classes.tsx           # Class list
│   │   ├── classes/
│   │   │   └── [classId].tsx    # Class detail
│   │   ├── sessions/
│   │   │   ├── new.tsx           # Record new session
│   │   │   └── [sessionId].tsx  # Session detail
│   │   └── profile.tsx           # Teacher profile
│   │
│   ├── (student)/                # Student route group (protected)
│   │   ├── _layout.tsx           # Student tabs layout
│   │   ├── index.tsx             # Student dashboard
│   │   ├── assignments.tsx       # Assignment list
│   │   ├── quran.tsx             # Quran viewer
│   │   ├── progress.tsx          # Progress tracking
│   │   └── profile.tsx           # Student profile
│   │
│   ├── (parent)/                 # Parent route group (protected)
│   │   ├── _layout.tsx           # Parent tabs layout
│   │   ├── index.tsx             # Parent dashboard
│   │   ├── children.tsx          # Children list
│   │   └── [childId]/
│   │       ├── index.tsx         # Child overview
│   │       └── progress.tsx      # Child progress
│   │
│   ├── _layout.tsx               # Root layout
│   ├── index.tsx                 # App entry/redirect
│   └── +not-found.tsx            # 404 page
│
├── components/
│   ├── ui/                       # React Native Reusables components
│   │   ├── button.tsx            # From RNR
│   │   ├── input.tsx             # From RNR
│   │   ├── card.tsx              # From RNR
│   │   ├── text.tsx              # From RNR
│   │   ├── select.tsx            # From RNR
│   │   ├── dialog.tsx            # From RNR
│   │   ├── avatar.tsx            # From RNR
│   │   ├── badge.tsx             # From RNR
│   │   ├── progress.tsx          # From RNR
│   │   └── separator.tsx         # From RNR
│   │
│   ├── layout/                   # Layout components
│   │   ├── screen-wrapper.tsx
│   │   ├── header.tsx
│   │   ├── tab-bar.tsx
│   │   └── safe-area.tsx
│   │
│   ├── forms/                    # Form components
│   │   ├── session-form.tsx
│   │   ├── assignment-form.tsx
│   │   └── form-field.tsx
│   │
│   ├── sessions/                 # Session components
│   │   ├── session-card.tsx
│   │   ├── session-list.tsx
│   │   ├── attendance-selector.tsx
│   │   ├── mistake-counter.tsx
│   │   └── quick-record.tsx
│   │
│   ├── students/                 # Student components
│   │   ├── student-card.tsx
│   │   ├── student-list.tsx
│   │   ├── assignment-card.tsx
│   │   └── progress-bar.tsx
│   │
│   ├── quran/                    # Quran viewer components
│   │   ├── quran-viewer.tsx
│   │   ├── ayah-view.tsx
│   │   ├── surah-picker.tsx
│   │   ├── bookmark-button.tsx
│   │   ├── audio-controls.tsx
│   │   └── annotation-layer.tsx
│   │
│   └── themed/                   # Theme-aware components
│       ├── themed-text.tsx
│       ├── themed-view.tsx
│       └── themed-icon.tsx
│
├── lib/
│   ├── trpc/
│   │   ├── client.ts             # tRPC React Query client
│   │   └── provider.tsx          # tRPC Provider
│   │
│   ├── auth/
│   │   ├── context.tsx           # Auth context provider
│   │   ├── storage.ts            # Secure token storage
│   │   └── hooks.ts              # useAuth, useUser hooks
│   │
│   ├── api-client.ts             # Base API configuration
│   ├── constants.ts              # App constants
│   └── utils.ts                  # Utility functions
│
├── hooks/
│   ├── use-color-scheme.ts       # Theme hook
│   ├── use-auth.ts               # Auth hook
│   ├── use-session.ts            # Session management
│   ├── use-orientation.ts        # Device orientation
│   └── use-offline.ts            # Offline detection
│
├── store/
│   ├── auth-store.ts             # Zustand auth store
│   ├── session-store.ts          # Local session state
│   └── settings-store.ts         # User preferences
│
├── types/
│   └── navigation.ts             # Navigation types
│
├── assets/
│   ├── images/                   # Images and icons
│   ├── fonts/                    # Custom fonts
│   └── audio/                    # Sound effects
│
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build configuration
├── babel.config.js               # Babel configuration
├── metro.config.js               # Metro bundler config
├── tailwind.config.js            # NativeWind/Tailwind config
├── tsconfig.json                 # TypeScript configuration
└── CLAUDE.md                     # This file
```

## Key Features & Implementation

### 1. Authentication Flow

**Setup:**
- Auth context in `lib/auth/context.tsx` with React Context
- Token stored in `expo-secure-store` (encrypted on-device storage)
- Role-based navigation: redirects to `/(teacher)`, `/(student)`, or `/(parent)` after login
- Root layout wraps app with AuthProvider and TRPCProvider

**Key hooks:**
- `useAuth()` - Access user, signIn, signOut
- Token automatically injected into tRPC headers

### 2. Teacher Session Recording

**Screen structure:**
- ScrollView with Card-based layout
- Student info header
- Attendance selector (radio group)
- Assignment forms (3 types: NEW_LESSON, NEAREST_REVIEW, GENERAL_REVIEW)
- Mistake counter
- Notes textarea
- Submit button with loading state

**Components:** Uses React Native Reusables (Card, Button, Input, Text)

### 3. Student Assignment View

**Dashboard features:**
- Pull-to-refresh for assignments
- Progress overview (pages memorized, current juz, streak)
- Assignment cards with completion actions
- Quick action buttons (Open Quran, View Progress)
- Personalized greeting

### 4. Quran Viewer with Annotations

**Features:**
- Surah/page picker for navigation
- ScrollView with Quran text and teacher annotations overlay
- Audio controls for recitation
- Ayah tap handlers for details

### 5. Tab Navigation

**Role-based tabs:**
- Each role has separate tab layout: `(teacher)`, `(student)`, `(parent)`
- Theme-aware tab bar colors
- Ionicons for tab icons
- Configured in `_layout.tsx` for each route group

## NativeWind Styling

- **NativeWind v4**: Tailwind CSS for React Native with `className` prop
- **Configuration**: `tailwind.config.js` with NativeWind preset
- **Theme**: HSL-based color tokens matching web (background, foreground, primary, etc.)
- **Usage**: Apply Tailwind classes directly: `className="bg-card p-4 rounded-lg"`

See [NativeWind docs](https://www.nativewind.dev) for complete API.

## React Native Reusables

Pre-built accessible components styled with NativeWind (shadcn/ui for React Native).

**Installation:** `npx @react-native-reusables/cli@latest add <component>`

**Key components:** Button, Card, Input, Text, Select, Dialog, Avatar, Badge, Progress, Switch, Checkbox

**Important:** Always use RNR's `Text` component, not React Native's, for consistent styling.

See [RNR docs](https://rnr-docs.vercel.app) for full component API.

## tRPC Integration

**Setup:** Provider in `lib/trpc/provider.tsx` wraps app with React Query + tRPC client
- `httpBatchLink` for request batching
- Token from SecureStore automatically injected into headers
- All procedures accessed via `api.router.procedure.useQuery()` or `.useMutation()`

## Offline Support

**Detection:** `useOffline()` hook with `@react-native-community/netinfo`
**Queue:** Zustand store with AsyncStorage persistence for offline mutations
**Sync:** Process queue when connection restored

## Push Notifications

**Setup:** Expo Notifications with permission handling in `lib/notifications.ts`
- Request permissions on device only (not simulator)
- Get Expo push token
- Configure notification handler
- Register token with backend

## Build Configuration

**EAS Build** configured in `eas.json`:
- **Development**: Dev client for debugging
- **Preview**: Internal testing (APK for Android)
- **Production**: Store-ready builds (AAB for Android)

**Commands:** `eas build --profile <profile> --platform <platform>`, `eas submit`

## Expo Configuration

**Key settings** in `app.json`:
- App name, slug, scheme (`hifzhub://`)
- Icons, splash screens, adaptive icons
- Plugins: expo-router, expo-secure-store, expo-notifications
- TypedRoutes experiment enabled
- Bundle IDs: `com.hifzhub.app`

## Performance

- **Lists**: Use FlashList for long lists (better than FlatList)
- **Images**: Use `expo-image` for better caching and transitions
- **Code splitting**: Lazy load heavy components with Suspense

## Environment Variables

**Required in `.env`:**
- `EXPO_PUBLIC_API_URL` - tRPC endpoint (use local IP like `http://192.168.1.5:3000/api/trpc`, NOT localhost)
- `EXPO_PUBLIC_APP_SCHEME` - Deep link scheme (`hifzhub`)

## Deployment

**Dev:** `pnpm dev`, then scan QR or `pnpm android/ios`
**Production:** `eas build --platform all`, `eas submit --platform all`
**OTA Updates:** `eas update --branch production`

## Best Practices

1. Use Expo Router (file-based routing)
2. Secure tokens with expo-secure-store
3. FlashList for long lists
4. Handle offline with queued mutations
5. Test on real devices (simulators miss issues)
6. Use RNR components for consistency
7. Always use RNR `Text`, not React Native `Text`
8. Request permissions gracefully
9. Profile performance with React DevTools

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Metro bundler issues | `pnpm start --clear` |
| API not connecting | Use local IP in `EXPO_PUBLIC_API_URL`, not localhost; check web server running |
| Build errors | `eas build --clear-cache` |
| App crashes | Check Expo Go logs, use console.log, React DevTools |

See root `CLAUDE.md` for monorepo guidance.