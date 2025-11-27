/**
 * tRPC Provider for mobile app
 */

import { authStorage } from '@/lib/auth/storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import Constants from 'expo-constants';
import { useState } from 'react';
import { api } from './client';

/**
 * Get the API URL for tRPC requests
 * 
 * Priority:
 * 1. EXPO_PUBLIC_API_URL environment variable (if set)
 * 2. Expo dev server hostname (when running in Expo Go)
 * 3. localhost fallback (only works in simulator/emulator)
 */
function getApiUrl(): string {
  // If explicitly set via environment variable, use it
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // In Expo Go, try to get the debugger hostname (your computer's IP)
  // This works automatically when scanning QR code
  // Try multiple possible locations for the hostname
  let debuggerHost: string | undefined;
  
  // Method 1: From expoConfig hostUri (Expo SDK 49+)
  if (Constants.expoConfig?.hostUri) {
    debuggerHost = Constants.expoConfig.hostUri.split(':')[0];
  }
  
  // Method 2: From manifest debuggerHost (older/newer Expo versions)
  if (!debuggerHost && Constants.manifest?.debuggerHost) {
    debuggerHost = Constants.manifest.debuggerHost.split(':')[0];
  }
  
  // Method 3: From manifest2 (newer Expo versions)
  if (!debuggerHost && Constants.manifest2?.extra?.expoGo?.debuggerHost) {
    debuggerHost = Constants.manifest2.extra.expoGo.debuggerHost.split(':')[0];
  }

  if (debuggerHost && debuggerHost !== 'localhost' && debuggerHost !== '127.0.0.1') {
    // Use port 3000 for the web server (where tRPC is hosted)
    return `http://${debuggerHost}:3000/api/trpc`;
  }

  // Fallback to localhost (only works in simulator/emulator)
  // In production, this should be set via EXPO_PUBLIC_API_URL
  return 'http://localhost:3000/api/trpc';
}

const API_URL = getApiUrl();

// Export for debugging purposes
export { getApiUrl };

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: API_URL,
          async headers() {
            // Get auth token for authenticated requests
            const token = await authStorage.getToken();
            return {
              authorization: token ? `Bearer ${token}` : '',
            };
          },
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
}
