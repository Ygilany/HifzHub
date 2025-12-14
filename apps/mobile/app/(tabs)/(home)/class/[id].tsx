import { StudentCard } from '@/components/home';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SectionHeader } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/lib/trpc/client';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const backgroundColor = useThemeColor({}, 'background');
  const router = useRouter();

  const { data: classData, isLoading, refetch, isRefetching } = api.classes.getById.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  const handleStudentPress = (studentId: string) => {
    router.push({
      pathname: '/(tabs)/(home)/student/[id]',
      params: { id: studentId },
    });
  };

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

  if (!classData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>Class not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const students = classData.students?.map((rel) => rel.student) || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
      >
        <ThemedView style={styles.headerSection}>
          <ThemedText style={styles.className}>{classData.name}</ThemedText>
          {classData.description && (
            <ThemedText style={styles.classDescription}>{classData.description}</ThemedText>
          )}
          {classData.program && (
            <ThemedText style={styles.programName}>Program: {classData.program.name}</ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <SectionHeader icon="people" title={`Students (${students.length})`} />

          {students.length > 0 ? (
            <View style={styles.studentsList}>
              {students.map((student) => (
                <StudentCard
                  key={student.id}
                  name={student.name}
                  avatar={getAvatarEmoji(student.name)}
                  onPress={() => handleStudentPress(student.id)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No students in this class</ThemedText>
            </View>
          )}
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
  headerSection: {
    padding: 16,
    marginBottom: 16,
  },
  className: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  classDescription: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  programName: {
    fontSize: 14,
    opacity: 0.5,
  },
  section: {
    padding: 16,
  },
  studentsList: {
    gap: 12,
    marginTop: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
