import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import './global.css';

import { AuthProvider } from '@/lib/auth/context';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider, useTheme } from '@/lib/theme-context';
import { TRPCProvider } from '@/lib/trpc/provider';

function RootLayoutNav() {
  const { colorScheme } = useTheme();
  
  const navigationTheme = colorScheme === 'dark' 
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, ...NAV_THEME.dark } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, ...NAV_THEME.light } };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <TRPCProvider>
      <AuthProvider>
        <ThemeProvider>
          <RootLayoutNav />
        </ThemeProvider>
      </AuthProvider>
    </TRPCProvider>
  );
}
