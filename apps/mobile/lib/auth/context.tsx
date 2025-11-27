/**
 * Authentication context for managing user session state
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { authStorage, type StoredUser } from './storage';

interface AuthContextType {
  user: StoredUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: (user: StoredUser, token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  // Check for stored auth on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Handle navigation based on auth state
  // Note: This effect is necessary for route protection in React Native
  // as there's no server-side redirect capability. This is the recommended
  // pattern for Expo Router authentication flows.
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to tabs if authenticated
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading, router]);

  const loadStoredAuth = async () => {
    try {
      const [storedUser, storedToken] = await Promise.all([
        authStorage.getUser(),
        authStorage.getToken(),
      ]);

      if (storedUser && storedToken) {
        setUser(storedUser);
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (newUser: StoredUser, newToken: string) => {
    await authStorage.setUser(newUser);
    await authStorage.setToken(newToken);
    setUser(newUser);
    setToken(newToken);
  };

  const signOut = async () => {
    await authStorage.clearAll();
    setUser(null);
    setToken(null);
  };

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
