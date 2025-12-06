import { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button, InputField } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/lib/trpc/client';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/lib/auth/context';

const USER_ROLES = [
  { label: 'Select a role...', value: '' },
  { label: 'Teacher', value: 'TEACHER' },
  { label: 'Teaching Assistant', value: 'ASSISTANT' },
  { label: 'Student', value: 'STUDENT' },
  { label: 'Parent', value: 'PARENT' },
] as const;

export default function RegisterScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const { signIn } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const registerMutation = api.auth.register.useMutation({
    onSuccess: async (data) => {
      try {
        // Store token and user data using auth context
        await signIn(data.user, data.token);
        // Navigation will be handled automatically by AuthProvider
      } catch (error) {
        console.error('Failed to store auth data:', error);
        Alert.alert('Error', 'Failed to save registration data');
      }
    },
    onError: (error) => {
      Alert.alert('Registration Failed', error.message);
    },
  });

  const handleRegister = () => {
    if (!name || !email || !password || !role) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    registerMutation.mutate({
      name,
      email,
      password,
      role: role as 'TEACHER' | 'ASSISTANT' | 'STUDENT' | 'PARENT' | 'ADMIN',
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.content}>
            <ThemedView style={styles.header}>
              <ThemedText type="title" style={styles.title}>
                Create Account
              </ThemedText>
              <ThemedText style={styles.subtitle}>Sign up to get started</ThemedText>
            </ThemedView>

            <ThemedView style={styles.form}>
              <InputField
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                editable={!registerMutation.isPending}
              />

              <InputField
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!registerMutation.isPending}
              />

              <InputField
                label="Password"
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!registerMutation.isPending}
              />

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Role</ThemedText>
                <View style={[styles.pickerContainer, { borderColor, backgroundColor }]}>
                  <Picker
                    selectedValue={role}
                    onValueChange={setRole}
                    enabled={!registerMutation.isPending}
                    style={{ color: textColor }}
                  >
                    {USER_ROLES.map((r) => (
                      <Picker.Item key={r.value} label={r.label} value={r.value} />
                    ))}
                  </Picker>
                </View>
              </View>

              <Button
                title="Sign Up"
                onPress={handleRegister}
                loading={registerMutation.isPending}
                disabled={registerMutation.isPending}
              />

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => router.back()}
                disabled={registerMutation.isPending}
              >
                <ThemedText style={[styles.linkText, { color: tintColor }]}>
                  Already have an account? Sign in
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
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
