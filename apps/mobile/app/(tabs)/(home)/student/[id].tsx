import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/lib/trpc/client';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StudentProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const backgroundColor = useThemeColor({}, 'background');

  // Fetch all students to find the one we're looking for
  // In a real app, you'd want a getStudentById endpoint
  const { data: students, isLoading } = api.teachers.getMyStudents.useQuery();

  const student = students?.find((s) => s.id === id);

  const getAvatarEmoji = (name: string) => {
    const firstLetter = name.charAt(0).toUpperCase();
    const emojiMap: Record<string, string> = {
      A: '👦', B: '👧', C: '👶', D: '🧒', E: '👨', F: '👩',
      G: '👦', H: '👧', I: '👶', J: '🧒', K: '👨', L: '👩',
      M: '👦', N: '👧', O: '👶', P: '🧒', Q: '👨', R: '👩',
      S: '👦', T: '👧', U: '👶', V: '🧒', W: '👨', X: '👩',
      Y: '👦', Z: '👧',
    };
    return emojiMap[firstLetter] || '👤';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!student) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>Student not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <ThemedText style={styles.avatarEmoji}>{getAvatarEmoji(student.name)}</ThemedText>
          </View>
          <ThemedText style={styles.studentName}>{student.name}</ThemedText>
          <ThemedText style={styles.studentEmail}>{student.email}</ThemedText>

          <View style={styles.infoSection}>
            <ThemedText style={styles.sectionTitle}>Student Information</ThemedText>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Role:</ThemedText>
              <ThemedText style={styles.infoValue}>{student.role}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Student ID:</ThemedText>
              <ThemedText style={styles.infoValue}>{student.id}</ThemedText>
            </View>
            {student.createdAt && (
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Member Since:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {new Date(student.createdAt).toLocaleDateString()}
                </ThemedText>
              </View>
            )}
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatarEmoji: {
    fontSize: 44,
    lineHeight: 52,
    textAlign: 'center',
    includeFontPadding: false,
  },
  studentName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 24,
  },
  infoSection: {
    width: '100%',
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
