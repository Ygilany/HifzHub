# CLAUDE.md - Mobile App

This file provides guidance to Claude Code (claude.ai/code) when working with the Expo mobile application.

## Development Commands

```bash
# From root directory
turbo run dev --filter=mobile       # Start Expo dev server
turbo run android --filter=mobile   # Run on Android
turbo run ios --filter=mobile       # Run on iOS
turbo run build --filter=mobile     # Export static build

# From apps/mobile directory
pnpm dev                            # Start Expo dev server
pnpm android                        # Run on Android emulator
pnpm ios                            # Run on iOS simulator
pnpm web                            # Run in web browser
pnpm build                          # Export static build (expo export)
pnpm lint                           # Run Expo lint
```

## Architecture

### Framework Stack
- **Expo SDK 54**: Managed Expo workflow
- **React Native 0.81.5**: With New Architecture enabled
- **React 19**: Latest React
- **TypeScript 5**: Full type safety
- **Expo Router 6**: File-based routing and navigation

### Expo Configuration (`app.json`)
- **App scheme**: `hifzhub://` for deep linking
- **New Architecture**: Enabled (`newArchEnabled: true`)
- **React Compiler**: Enabled for better performance
- **Typed Routes**: Enabled for type-safe navigation
- **Edge-to-edge**: Enabled on Android
- **Predictive Back**: Disabled on Android

### Navigation Structure

**Root Layout** (`app/_layout.tsx`):
- Stack navigator as root
- Anchor point set to `(tabs)` - this is the default route
- Modal route configured with modal presentation
- Theme provider wraps entire app (dark/light mode support)

**Tab Navigation** (`app/(tabs)/_layout.tsx`):
- Bottom tabs using `(tabs)` route group
- Tabs: `index.tsx` (home) and `explore.tsx`
- Route groups with `()` don't appear in URL

**Route Patterns**:
- `app/(tabs)/index.tsx` → main tab screen
- `app/(tabs)/explore.tsx` → explore tab
- `app/modal.tsx` → modal screen accessible via `router.push('/modal')`

### Component Architecture

**Themed Components** (`components/`):
- `themed-text.tsx`, `themed-view.tsx`: Automatic dark/light mode support
- Custom components use `useColorScheme()` hook from `hooks/use-color-scheme.ts`
- Colors adapt based on system theme preference

**UI Components** (`components/ui/`):
- Reusable UI primitives
- Follow atomic design principles

**Specialized Components**:
- `haptic-tab.tsx`: Tabs with haptic feedback
- `parallax-scroll-view.tsx`: Scroll views with parallax effects
- `external-link.tsx`: Links that open in browser

### Platform Support
- **iOS**: Full support including tablets (`supportsTablet: true`)
- **Android**: Adaptive icons with foreground/background/monochrome images
- **Web**: Static export support (`output: "static"`)

### Animations and Interactions
- **Reanimated 4**: For smooth animations
- **Worklets**: Enabled for JS thread offloading
- **Gesture Handler**: For advanced touch interactions
- **Haptics**: Tactile feedback on supported devices

### Theme System
- `useColorScheme()` hook returns 'light' or 'dark'
- System UI automatically adapts (`userInterfaceStyle: "automatic"`)
- Navigation theme switches between `DarkTheme` and `DefaultTheme`
- Custom themed components in `components/` directory

### Important Expo Patterns

**File-based Routing**:
- Folders with `()` are route groups (layout-only, don't affect URLs)
- `_layout.tsx` files define layout for that route segment
- `index.tsx` is the default route in a directory

**Deep Linking**:
- Custom scheme: `hifzhub://`
- Expo Router handles deep links automatically
- Access via `useLocalSearchParams()` hook

**Navigation**:
```typescript
import { router } from 'expo-router';
router.push('/path');           // Navigate to route
router.back();                  // Go back
router.replace('/path');        // Replace current route
```

**Assets**:
- Images in `assets/images/`
- Icons configured in `app.json`
- Use `expo-image` for optimized image loading
