import { ClassCard } from '@/components/home';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SectionHeader } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/lib/trpc/client';
import { useRouter } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClassesScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const router = useRouter();

  const { data: programs, isLoading, refetch, isRefetching } = api.teachers.getMyPrograms.useQuery();

  const handleClassPress = (classId: string) => {
    router.push({
      pathname: '/(tabs)/(home)/class/[id]',
      params: { id: classId },
    });
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

  // Flatten all classes from all programs
  const allClasses = programs?.flatMap((program) => 
    program.classes?.map((classItem) => ({
      ...classItem,
      programName: program.name,
    })) || []
  ) || [];

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
          <SectionHeader icon="school" title="My Classes" />
          
          {allClasses.length > 0 ? (
            <View style={styles.classesList}>
              {allClasses.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  name={classItem.name}
                  description={classItem.description}
                  studentCount={classItem.students?.length}
                  onPress={() => handleClassPress(classItem.id)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No classes found</ThemedText>
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
  classesList: {
    gap: 16,
    marginTop: 16,
  },
  programSection: {
    gap: 12,
  },
  programName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
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
