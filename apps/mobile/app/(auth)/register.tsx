import { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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
  const mutedForeground = useThemeColor({}, 'mutedForeground');
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
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Full Name</ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor, backgroundColor }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={mutedForeground}
                  value={name}
                  onChangeText={setName}
                  editable={!registerMutation.isPending}
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor, backgroundColor }]}
                  placeholder="Enter your email"
                  placeholderTextColor={mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!registerMutation.isPending}
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor, borderColor, backgroundColor }]}
                  placeholder="Create a password (min 6 characters)"
                  placeholderTextColor={mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!registerMutation.isPending}
                />
              </View>

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

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: tintColor },
                  registerMutation.isPending && styles.buttonDisabled,
                ]}
                onPress={handleRegister}
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
                )}
              </TouchableOpacity>

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
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
