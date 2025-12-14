import { StudentCard } from '@/components/home';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SectionHeader } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/lib/trpc/client';
import { useRouter } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StudentsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const router = useRouter();

  const { data: students, isLoading, refetch, isRefetching } = api.teachers.getMyStudents.useQuery();

  const handleStudentPress = (studentId: string) => {
    router.push({
      pathname: '/(tabs)/(home)/student/[id]',
      params: { id: studentId },
    });
  };

  const getAvatarEmoji = (name: string) => {
    // Simple emoji based on first letter
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
      >
        <ThemedView style={styles.section}>
          <SectionHeader icon="people" title="My Students" />
          
          {students && students.length > 0 ? (
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
              <ThemedText style={styles.emptyText}>No students found</ThemedText>
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
