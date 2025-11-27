import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 * Using useSyncExternalStore instead of useEffect for better SSR/hydration support
 */
export function useColorScheme() {
  const colorScheme = useRNColorScheme();

  // Track if we're on the client side
  const isClient = useSyncExternalStore(
    () => () => {}, // No-op subscribe since this never changes
    () => true, // Client-side value
    () => false // Server-side value
  );

  // Return actual color scheme on client, default to light on server
  return isClient ? colorScheme : 'light';
}
