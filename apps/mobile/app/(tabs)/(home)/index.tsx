import {
    AnimatedHeader,
    ClassCard,
    HEADER_MAX_HEIGHT_EXPORT,
    StudentCard,
} from '@/components/home';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SectionHeader } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/lib/auth/context';
import { api } from '@/lib/trpc/client';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    RefreshControl,
    StyleSheet,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();

  // Fetch data based on user role
  const { data: programs, isLoading: programsLoading, refetch: refetchPrograms } = 
    api.teachers.getMyPrograms.useQuery(undefined, { enabled: user?.role === 'TEACHER' });
  
  const { data: students, isLoading: studentsLoading, refetch: refetchStudents } = 
    api.teachers.getMyStudents.useQuery(undefined, { enabled: user?.role === 'TEACHER' });

  const isLoading = programsLoading || studentsLoading;

  const handleClassPress = (classId: string) => {
    console.log('Navigating to class:', classId);
    router.push({
      pathname: '/(tabs)/(home)/class/[id]',
      params: { id: classId },
    });
  };

  const handleStudentPress = (studentId: string) => {
    console.log('Navigating to student:', studentId);
    router.push({
      pathname: '/(tabs)/(home)/student/[id]',
      params: { id: studentId },
    });
  };

  const handleClassesHeaderPress = () => {
    console.log('Navigating to classes list');
    router.push('/(tabs)/(home)/classes');
  };

  const handleStudentsHeaderPress = () => {
    console.log('Navigating to students list');
    router.push('/(tabs)/(home)/students');
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

  // Get all classes from all programs
  const allClasses = programs?.flatMap((program) => 
    program.classes?.map((classItem) => ({
      ...classItem,
      programName: program.name,
    })) || []
  ) || [];

  const handleRefresh = () => {
    refetchPrograms();
    refetchStudents();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right']}>
      {/* Fixed Animated Header with Parallax */}
      <AnimatedHeader scrollY={scrollY} />

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingTop: HEADER_MAX_HEIGHT_EXPORT - insets.top,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {user?.role === 'TEACHER' ? (
          <>
            {/* Classes Section */}
            {allClasses.length > 0 && (
              <ThemedView style={styles.section}>
                <SectionHeader 
                  icon="school" 
                  title="My Classes" 
                  onPress={handleClassesHeaderPress}
                />
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" />
                  </View>
                ) : (
                  <View style={styles.classesList}>
                    {allClasses.slice(0, 5).map((classItem) => (
                      <ClassCard
                        key={classItem.id}
                        name={classItem.name}
                        description={classItem.description}
                        studentCount={classItem.students?.length}
                        onPress={() => handleClassPress(classItem.id)}
                      />
                    ))}
                    {allClasses.length > 5 && (
                      <ThemedText
                        style={styles.viewAllText}
                        onPress={() => router.push('/(tabs)/(home)/classes')}
                      >
                        View all {allClasses.length} classes →
                      </ThemedText>
                    )}
                  </View>
                )}
              </ThemedView>
            )}

            {/* Students Section */}
            <ThemedView style={styles.section}>
              <SectionHeader 
                icon="people" 
                title="My Students"
                onPress={handleStudentsHeaderPress}
              />
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" />
                </View>
              ) : students && students.length > 0 ? (
                <View style={styles.studentsList}>
                  {students.slice(0, 5).map((student) => (
                    <StudentCard
                      key={student.id}
                      name={student.name}
                      avatar={getAvatarEmoji(student.name)}
                      onPress={() => handleStudentPress(student.id)}
                    />
                  ))}
                  {students.length > 5 && (
                    <ThemedText
                      style={styles.viewAllText}
                      onPress={() => router.push('/(tabs)/(home)/students')}
                    >
                      View all {students.length} students →
                    </ThemedText>
                  )}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <ThemedText style={styles.emptyText}>No students found</ThemedText>
                </View>
              )}
            </ThemedView>
          </>
        ) : (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.roleText}>
              Welcome, {user?.name}! Your role-specific dashboard will be displayed here.
            </ThemedText>
          </ThemedView>
        )}

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </Animated.ScrollView>
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
  section: {
    padding: 16,
  },
  classesList: {
    gap: 12,
    marginTop: 16,
  },
  studentsList: {
    gap: 12,
    marginTop: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
  viewAllText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  roleText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    padding: 20,
  },
});
