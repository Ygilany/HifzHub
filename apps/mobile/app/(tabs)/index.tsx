import { ScrollView, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/lib/trpc/client';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getApiUrl } from '@/lib/trpc/provider';

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

  // Fetch data using tRPC
  const { data: students, isLoading: studentsLoading, error: studentsError } = api.test.getStudents.useQuery();
  const { data: greeting, error: greetingError } = api.test.hello.useQuery({ name: 'Mobile App' });

  if (studentsLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <ThemedText style={{ marginTop: 16 }}>Loading students...</ThemedText>
          <ThemedText style={{ marginTop: 8, fontSize: 12, opacity: 0.6 }}>
            API: {getApiUrl()}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (studentsError) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <View style={styles.centered}>
          <ThemedText style={styles.errorTitle}>❌ Connection Error</ThemedText>
          <ThemedText style={styles.errorText}>
            {studentsError.message}
          </ThemedText>
          <ThemedText style={styles.errorHint}>
            Make sure:
          </ThemedText>
          <ThemedText style={styles.errorHint}>
            1. Web server is running (pnpm dev in apps/web)
          </ThemedText>
          <ThemedText style={styles.errorHint}>
            2. API URL: {getApiUrl()}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top']}>
      <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">HifzHub Mobile</ThemedText>
        <ThemedText style={styles.subtitle}>tRPC Demo</ThemedText>
        {greeting && (
          <ThemedText style={styles.greeting}>{greeting.message}</ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Students ({students?.length || 0})
        </ThemedText>
        <ThemedText style={styles.description}>
          Data fetched from tRPC API
        </ThemedText>

        {students?.map((student) => (
          <ThemedView key={student.id} style={[styles.card, { borderColor }]}>
            <ThemedText type="defaultSemiBold" style={styles.studentName}>
              {student.name}
            </ThemedText>
            <ThemedText style={styles.studentEmail}>{student.email}</ThemedText>
            <ThemedText style={styles.studentClass}>
              Class: {student.className}
            </ThemedText>

            <View style={[styles.statsRow, { borderTopColor: borderColor }]}>
              <View style={styles.stat}>
                <ThemedText style={styles.statLabel}>Pages</ThemedText>
                <ThemedText style={styles.statValue}>
                  {student.pagesMemorized}
                </ThemedText>
              </View>
              <View style={styles.stat}>
                <ThemedText style={styles.statLabel}>Juz</ThemedText>
                <ThemedText style={styles.statValue}>
                  {student.currentJuz}
                </ThemedText>
              </View>
              <View style={styles.stat}>
                <ThemedText style={styles.statLabel}>Streak</ThemedText>
                <ThemedText style={styles.statValue}>{student.streak}</ThemedText>
              </View>
            </View>
          </ThemedView>
        ))}
      </ThemedView>

      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>
          ✅ tRPC is working! Data fetched successfully from the API.
        </ThemedText>
      </ThemedView>
    </ScrollView>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.7,
  },
  greeting: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.6,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 16,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  studentName: {
    fontSize: 18,
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  studentClass: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorHint: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
    paddingHorizontal: 20,
  },
});
