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

**Auth Context** (`lib/auth/context.tsx`):
```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { api } from '../trpc/client';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const signInMutation = api.auth.signIn.useMutation({
    onSuccess: async (data) => {
      await SecureStore.setItemAsync('token', data.token);
      setUser(data.user);
      router.replace(`/(${data.user.role.toLowerCase()})`);
    },
  });

  const signIn = async (email: string, password: string) => {
    await signInMutation.mutateAsync({ email, password });
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('token');
    setUser(null);
    router.replace('/(auth)/login');
  };

  useEffect(() => {
    // Check for existing token on mount
    SecureStore.getItemAsync('token').then((token) => {
      if (token) {
        // Validate token and fetch user
        api.auth.me.query().then(setUser);
      }
      setIsLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

**Root Layout with Auth** (`app/_layout.tsx`):
```typescript
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TRPCProvider } from '@/lib/trpc/provider';
import { AuthProvider } from '@/lib/auth/context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TRPCProvider>
      <AuthProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(teacher)" />
          <Stack.Screen name="(student)" />
          <Stack.Screen name="(parent)" />
        </Stack>
      </AuthProvider>
    </TRPCProvider>
  );
}
```

### 2. Teacher Session Recording

**Quick Session Recording** (`app/(teacher)/sessions/new.tsx`):
```typescript
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AttendanceSelector } from '@/components/sessions/attendance-selector';
import { MistakeCounter } from '@/components/sessions/mistake-counter';
import { AssignmentForm } from '@/components/forms/assignment-form';
import { useToast } from '@/components/ui/toast';

export default function NewSessionScreen() {
  const { studentId } = useLocalSearchParams();
  const [attendance, setAttendance] = useState('PRESENT');
  const [mistakes, setMistakes] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const student = api.student.getById.useQuery({ id: studentId as string });
  const createSession = api.session.create.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Session recorded successfully' });
      router.back();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = () => {
    createSession.mutate({
      studentId: studentId as string,
      attendance,
      mistakes,
      assignments,
      notes,
    });
  };

  if (student.isLoading) return <LoadingSpinner />;

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-6">
        {/* Student Header */}
        <Card>
          <CardContent className="pt-6">
            <Text className="text-xl font-bold">{student.data?.name}</Text>
            <Text className="text-muted-foreground">{student.data?.class.name}</Text>
          </CardContent>
        </Card>

        {/* Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceSelector value={attendance} onChange={setAttendance} />
          </CardContent>
        </Card>

        {/* Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <AssignmentForm
              types={['NEW_LESSON', 'NEAREST_REVIEW', 'GENERAL_REVIEW']}
              value={assignments}
              onChange={setAssignments}
            />
          </CardContent>
        </Card>

        {/* Mistakes */}
        <Card>
          <CardHeader>
            <CardTitle>Mistakes</CardTitle>
          </CardHeader>
          <CardContent>
            <MistakeCounter value={mistakes} onChange={setMistakes} />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              multiline
              numberOfLines={4}
              placeholder="Session notes..."
              value={notes}
              onChangeText={setNotes}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit}
          disabled={createSession.isPending}
        >
          <Text>{createSession.isPending ? 'Saving...' : 'Record Session'}</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
```

### 3. Student Assignment View

**Student Dashboard** (`app/(student)/index.tsx`):
```typescript
import { ScrollView, RefreshControl } from 'react-native';
import { api } from '@/lib/trpc/client';
import { useAuth } from '@/lib/auth/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Progress } from '@/components/ui/progress';
import { AssignmentCard } from '@/components/students/assignment-card';
import { router } from 'expo-router';

export default function StudentDashboardScreen() {
  const { user } = useAuth();
  const assignments = api.assignment.getMy.useQuery();
  const progress = api.student.getProgress.useQuery();

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl
          refreshing={assignments.isRefetching}
          onRefresh={() => assignments.refetch()}
        />
      }
    >
      <View className="p-4 gap-6">
        {/* Welcome Header */}
        <View>
          <Text className="text-2xl font-bold">
            As-Salamu Alaykum, {user?.name}
          </Text>
          <Text className="text-muted-foreground">
            Continue your Hifz journey
          </Text>
        </View>

        {/* Progress Overview */}
        {progress.data && (
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <View>
                <View className="flex-row justify-between mb-2">
                  <Text>Pages Memorized</Text>
                  <Text>{progress.data.pagesMemorized} / 604</Text>
                </View>
                <Progress 
                  value={(progress.data.pagesMemorized / 604) * 100} 
                  className="h-2"
                />
              </View>
              
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-2xl font-bold">
                    {progress.data.currentJuz}
                  </Text>
                  <Text className="text-muted-foreground">Current Juz</Text>
                </View>
                <View>
                  <Text className="text-2xl font-bold">
                    {progress.data.streak}
                  </Text>
                  <Text className="text-muted-foreground">Day Streak</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Current Assignments */}
        <View>
          <Text className="text-xl font-bold mb-2">Current Assignments</Text>
          <View className="gap-4">
            {assignments.data?.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onComplete={() => {
                  api.assignment.markComplete.mutate({ id: assignment.id });
                }}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="gap-2">
            <Button
              variant="outline"
              onPress={() => router.push('/(student)/quran')}
            >
              <Text>Open Quran</Text>
            </Button>
            <Button
              variant="outline"
              onPress={() => router.push('/(student)/progress')}
            >
              <Text>View Progress</Text>
            </Button>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
```

### 4. Quran Viewer with Annotations

**Quran Viewer Screen** (`app/(student)/quran.tsx`):
```typescript
import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { api } from '@/lib/trpc/client';
import { QuranViewer } from '@/components/quran/quran-viewer';
import { SurahPicker } from '@/components/quran/surah-picker';
import { AudioControls } from '@/components/quran/audio-controls';
import { AnnotationLayer } from '@/components/quran/annotation-layer';

export default function QuranViewerScreen() {
  const [surah, setSurah] = useState(1);
  const [page, setPage] = useState(1);
  
  const quranText = api.quran.getText.useQuery({ surah, page });
  const annotations = api.annotation.getForPage.useQuery({ surah, page });

  return (
    <View className="flex-1 bg-background">
      {/* Header with Surah Picker */}
      <SurahPicker
        currentSurah={surah}
        onSelect={setSurah}
      />

      {/* Quran Text with Annotations */}
      <ScrollView className="flex-1">
        <QuranViewer
          text={quranText.data}
          annotations={annotations.data}
          onAyahPress={(ayah) => {
            // Show ayah details
          }}
        />
      </ScrollView>

      {/* Audio Controls */}
      <AudioControls
        surah={surah}
        onPlay={() => {}}
        onPause={() => {}}
      />
    </View>
  );
}
```

### 5. Tab Navigation

**Teacher Tabs Layout** (`app/(teacher)/_layout.tsx`):
```typescript
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TeacherLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: 'Classes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

## NativeWind Styling

### Configuration (`tailwind.config.js`):
```javascript
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... RNR color tokens
      },
    },
  },
  plugins: [],
};
```

### Using NativeWind:
```typescript
import { View, Text } from 'react-native';

export function Card({ children }) {
  return (
    <View className="bg-card p-4 rounded-lg shadow-sm">
      <Text className="text-lg font-semibold text-foreground">
        {children}
      </Text>
    </View>
  );
}
```

## React Native Reusables

React Native Reusables provides accessible, pre-built components styled with NativeWind. These components are based on shadcn/ui but adapted for React Native.

### Installation:
```bash
# From apps/mobile directory
npx @react-native-reusables/cli@latest init

# Add specific components
npx @react-native-reusables/cli@latest add button
npx @react-native-reusables/cli@latest add card
npx @react-native-reusables/cli@latest add input
npx @react-native-reusables/cli@latest add select
npx @react-native-reusables/cli@latest add dialog
```

### Using RNR Components:
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

export function SessionForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Session</CardTitle>
      </CardHeader>
      <CardContent className="gap-4">
        <Input placeholder="Student name" />
        <Button onPress={() => {}}>
          <Text>Save Session</Text>
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Available RNR Components:
- **Button**: Primary, secondary, outline, ghost variants
- **Card**: Container with header, content, footer sections
- **Input**: Text input with label and error states
- **Text**: Typography with size and color variants
- **Select**: Native picker with consistent styling
- **Dialog**: Modal dialogs and bottom sheets
- **Avatar**: User profile images with fallback
- **Badge**: Status indicators and labels
- **Progress**: Progress bars and indicators
- **Separator**: Horizontal and vertical dividers
- **Switch**: Toggle switches
- **Checkbox**: Checkboxes with labels
- **RadioGroup**: Radio button groups

### Theming with RNR:
```typescript
// lib/theme.ts
export const theme = {
  light: {
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(240 10% 3.9%)',
    primary: 'hsl(240 5.9% 10%)',
    // ... more colors
  },
  dark: {
    background: 'hsl(240 10% 3.9%)',
    foreground: 'hsl(0 0% 98%)',
    primary: 'hsl(0 0% 98%)',
    // ... more colors
  },
};

// Apply theme in root layout
import { useColorScheme } from '@/hooks/use-color-scheme';
import { setAndroidNavigationBar } from '@/lib/android-navigation-bar';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  
  useEffect(() => {
    setAndroidNavigationBar(colorScheme);
  }, [colorScheme]);

  return <Slot />;
}
```

## tRPC Integration

**tRPC Provider** (`lib/trpc/provider.tsx`):
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { api } from './client';
import * as SecureStore from 'expo-secure-store';

export function TRPCProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: process.env.EXPO_PUBLIC_API_URL!,
          async headers() {
            const token = await SecureStore.getItemAsync('token');
            return token ? { authorization: `Bearer ${token}` } : {};
          },
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

## Offline Support

**Offline Detection** (`hooks/use-offline.ts`):
```typescript
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });

    return unsubscribe;
  }, []);

  return isOffline;
}
```

**Queue for Offline Actions**:
```typescript
// store/offline-queue.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OfflineAction {
  id: string;
  type: 'createSession' | 'updateAssignment';
  data: any;
  timestamp: number;
}

export const useOfflineQueue = create(
  persist(
    (set, get) => ({
      queue: [] as OfflineAction[],
      addToQueue: (action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
        set((state) => ({
          queue: [
            ...state.queue,
            {
              ...action,
              id: Date.now().toString(),
              timestamp: Date.now(),
            },
          ],
        }));
      },
      processQueue: async () => {
        const { queue } = get();
        // Process each action
        for (const action of queue) {
          try {
            // Send to server
            await api[action.type].mutate(action.data);
            // Remove from queue
            set((state) => ({
              queue: state.queue.filter((a) => a.id !== action.id),
            }));
          } catch (error) {
            console.error('Failed to process action:', error);
          }
        }
      },
    }),
    {
      name: 'offline-queue',
      storage: AsyncStorage,
    }
  )
);
```

## Push Notifications

**Setup** (`lib/notifications.ts`):
```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  
  return token.data;
}
```

## Build Configuration

**EAS Build** (`eas.json`):
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Build Commands**:
```bash
# Development build
eas build --profile development --platform ios

# Preview build (internal testing)
eas build --profile preview --platform android

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Expo App Configuration

**Key Settings** (`app.json`):
```json
{
  "expo": {
    "name": "HifzHub",
    "slug": "hifzhub",
    "scheme": "hifzhub",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "icon": "./assets/images/icon.png",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.hifzhub.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.hifzhub.app"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

## Performance Optimizations

### List Rendering:
```typescript
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={students}
  renderItem={({ item }) => <StudentCard student={item} />}
  estimatedItemSize={100}
  keyExtractor={(item) => item.id}
/>
```

### Image Optimization:
```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: student.avatar }}
  contentFit="cover"
  transition={200}
  style={{ width: 100, height: 100 }}
/>
```

### Code Splitting:
```typescript
import { lazy, Suspense } from 'react';

const QuranViewer = lazy(() => import('@/components/quran/quran-viewer'));

<Suspense fallback={<Loading />}>
  <QuranViewer />
</Suspense>
```

## Testing

```bash
# Run tests
pnpm test

# E2E tests (Detox)
pnpm test:e2e:ios
pnpm test:e2e:android

# Type checking
pnpm typecheck
```

## Environment Variables

**Required in `.env`:**
```bash
EXPO_PUBLIC_API_URL="http://192.168.1.5:3000/api/trpc"  # Use local IP, not localhost
EXPO_PUBLIC_APP_SCHEME="hifzhub"
```

## Deployment

### Development:
```bash
# Start Expo dev server
pnpm dev

# Run on device
pnpm android
pnpm ios
```

### Production:
```bash
# Build for production
eas build --platform all

# Submit to stores
eas submit --platform all

# Update OTA
eas update --branch production
```

## Best Practices

1. **Use Expo Router for navigation** - File-based routing is cleaner
2. **Secure sensitive data** - Use `expo-secure-store` for tokens
3. **Optimize lists** - Use `FlashList` for long lists
4. **Handle offline** - Queue actions when offline
5. **Push notifications** - Keep users engaged
6. **Type everything** - Leverage TypeScript
7. **Test on real devices** - Simulators don't catch everything
8. **Handle permissions** - Request permissions gracefully
9. **Optimize images** - Use `expo-image` for better performance
10. **Profile performance** - Use React DevTools Profiler
11. **Use RNR components** - Pre-built, accessible, consistent styling
12. **Follow RNR conventions** - Use Text component from RNR, not React Native

## Troubleshooting

**Metro bundler issues:**
```bash
pnpm start --clear
```

**API not connecting:**
- Check `EXPO_PUBLIC_API_URL` uses your computer's local IP
- Ensure web dev server is running
- Check firewall settings

**Build errors:**
```bash
eas build --clear-cache
```

**App crashes:**
- Check error logs in Expo Go app
- Use `console.log` for debugging
- Check React DevTools

For additional guidance, see the root `CLAUDE.md` file.