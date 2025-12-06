import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button, InputField } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/lib/auth/context';
import { api } from '@/lib/trpc/client';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = api.auth.login.useMutation({
    onSuccess: async (data) => {
      try {
        // Store token and user data using auth context
        await signIn(data.user, data.token);
        // Navigation will be handled automatically by AuthProvider
      } catch (error) {
        console.error('Failed to store auth data:', error);
        Alert.alert('Error', 'Failed to save login data');
      }
    },
    onError: (error) => {
      Alert.alert('Login Failed', error.message);
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ThemedView style={styles.content}>
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              HifzHub
            </ThemedText>
            <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>
          </ThemedView>

          <ThemedView style={styles.form}>
            <InputField
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loginMutation.isPending}
            />

            <InputField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loginMutation.isPending}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loginMutation.isPending}
              disabled={loginMutation.isPending}
            />

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push('/(auth)/register')}
              disabled={loginMutation.isPending}
            >
              <ThemedText style={[styles.linkText, { color: tintColor }]}>
                Don&apos;t have an account? Sign up
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    width: '100%',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
