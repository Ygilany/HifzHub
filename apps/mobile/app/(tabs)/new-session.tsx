import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/lib/trpc/client';
import { Ionicons } from '@expo/vector-icons';
import { useNavigationState } from '@react-navigation/native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Helper to extract student ID from navigation state
function findStudentIdInState(state: any): string | null {
  if (!state?.routes) return null;

  for (const route of state.routes) {
    // Check if this route is a student profile route
    if (route.name === 'student/[id]/index' && route.params?.id) {
      return route.params.id;
    }
    // Recursively check nested state
    if (route.state) {
      const found = findStudentIdInState(route.state);
      if (found) return found;
    }
  }
  return null;
}

export default function NewSessionScreen() {
  const router = useRouter();

  // Get the full navigation state from the parent navigator
  const navState = useNavigationState((state) => state);
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'mutedForeground');
  const tintColor = useThemeColor({}, 'tint');

  const [searchQuery, setSearchQuery] = useState('');
  const hasAutoNavigated = useRef(false);

  const { data: students, isLoading } = api.teachers.getMyStudents.useQuery();

  // Auto-navigate to session form if a student profile is in the home stack
  useFocusEffect(
    useCallback(() => {
      // Find the (home) tab's state from the tab navigator state
      const homeRoute = navState?.routes?.find((r: any) => r.name === '(home)');
      const homeState = homeRoute?.state;

      console.log('=== New Session Tab Focus ===');
      console.log('Nav state routes:', navState?.routes?.map((r: any) => r.name));
      console.log('Home state:', JSON.stringify(homeState, null, 2));

      const studentId = findStudentIdInState(homeState);

      console.log('Found student ID:', studentId);
      console.log('hasAutoNavigated.current:', hasAutoNavigated.current);

      if (studentId && !hasAutoNavigated.current) {
        // Check the current route in home stack
        const homeIndex = homeState?.index ?? 0;
        const currentHomeRoute = homeState?.routes?.[homeIndex];
        const isOnStudentProfile = currentHomeRoute?.name === 'student/[id]/index';
        const isOnNewSession = currentHomeRoute?.name === 'student/[id]/new-session';

        console.log('Current home route:', currentHomeRoute?.name);

        // Only auto-navigate if we're on the student profile page (not already on new-session)
        if (isOnStudentProfile) {
          console.log('Auto-navigating to session form for student:', studentId);
          hasAutoNavigated.current = true;
          // Small delay to ensure the tab transition completes first
          setTimeout(() => {
            router.navigate(`/student/${studentId}/new-session`);
          }, 50);
        } else if (isOnNewSession) {
          console.log('Already on new-session page, skipping navigation');
        } else {
          console.log('Not on student profile, showing student picker');
        }
      } else {
        console.log('Not auto-navigating. Reason:', !studentId ? 'No student ID found' : 'Already navigated');
      }

      // Reset when leaving so it works again next time
      return () => {
        console.log('Leaving new-session tab, resetting hasAutoNavigated');
        hasAutoNavigated.current = false;
      };
    }, [navState, router])
  );

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (!searchQuery.trim()) return students;

    const query = searchQuery.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

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

  const handleSelectStudent = (studentId: string) => {
    router.push(`/student/${studentId}/new-session`);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={[styles.loadingText, { color: mutedColor }]}>
            Loading students...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>New Session</ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: mutedColor }]}>
          Select a student to record a session
        </ThemedText>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: cardColor, borderColor }]}>
          <Ionicons name="search" size={20} color={mutedColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search students..."
            placeholderTextColor={mutedColor}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={mutedColor} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Student List */}
      {!students || students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={mutedColor} />
          <ThemedText style={[styles.emptyTitle, { color: mutedColor }]}>
            No Students Found
          </ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: mutedColor }]}>
            You don't have any students assigned yet.
          </ThemedText>
        </View>
      ) : filteredStudents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={mutedColor} />
          <ThemedText style={[styles.emptyTitle, { color: mutedColor }]}>
            No Results
          </ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: mutedColor }]}>
            No students match "{searchQuery}"
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelectStudent(item.id)}
              style={({ pressed }) => [
                styles.studentCard,
                { backgroundColor: cardColor, borderColor },
                pressed && styles.studentCardPressed,
              ]}
            >
              <View style={styles.avatarContainer}>
                <ThemedText style={styles.avatarEmoji}>
                  {getAvatarEmoji(item.name)}
                </ThemedText>
              </View>
              <View style={styles.studentInfo}>
                <ThemedText style={styles.studentName}>{item.name}</ThemedText>
                <ThemedText style={[styles.studentEmail, { color: mutedColor }]}>
                  {item.email}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={mutedColor} />
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  studentCardPressed: {
    opacity: 0.7,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 13,
  },
  separator: {
    height: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
