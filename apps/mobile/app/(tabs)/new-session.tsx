import { Ionicons } from '@expo/vector-icons';
import { useNavigationState } from '@react-navigation/native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground, GlassAvatar, GlassCard } from '@/components/glass';
import { GlassFonts, GlassTheme } from '@/constants/glass-theme';
import { api } from '@/lib/trpc/client';

const STUDENT_PALETTE = [
  '#4a5d3a', '#b88835', '#7b5a8e', '#a0522d', '#2e5a5a', '#3a5577',
];

function findStudentIdInState(state: any): string | null {
  if (!state?.routes) return null;
  for (const route of state.routes) {
    if (route.name === 'student/[id]/index' && route.params?.id) {
      return route.params.id;
    }
    if (route.state) {
      const found = findStudentIdInState(route.state);
      if (found) return found;
    }
  }
  return null;
}

export default function NewSessionScreen() {
  const router = useRouter();
  const navState = useNavigationState((state) => state);
  const [searchQuery, setSearchQuery] = useState('');
  const hasAutoNavigated = useRef(false);

  const { data: students, isLoading } = api.teachers.getMyStudents.useQuery();

  useFocusEffect(
    useCallback(() => {
      const homeRoute = navState?.routes?.find((r: any) => r.name === '(home)');
      const homeState = homeRoute?.state;
      const studentId = findStudentIdInState(homeState);

      if (studentId && !hasAutoNavigated.current) {
        const homeIndex = homeState?.index ?? 0;
        const currentHomeRoute = homeState?.routes?.[homeIndex];
        const isOnStudentProfile = currentHomeRoute?.name === 'student/[id]/index';
        if (isOnStudentProfile) {
          hasAutoNavigated.current = true;
          setTimeout(() => {
            router.navigate(`/student/${studentId}/new-session`);
          }, 50);
        }
      }
      return () => {
        hasAutoNavigated.current = false;
      };
    }, [navState, router]),
  );

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
    );
  }, [students, searchQuery]);

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>NEW SESSION</Text>
          <Text style={styles.title}>Assign work</Text>
          <Text style={styles.sub}>Choose a student to record their session.</Text>
        </View>

        <GlassCard radius={18} style={styles.searchCard}>
          <View style={styles.searchInner}>
            <Ionicons name="search" size={18} color={GlassTheme.inkSubtle} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search students"
              placeholderTextColor={GlassTheme.inkSubtle}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={GlassTheme.inkSubtle} />
              </Pressable>
            )}
          </View>
        </GlassCard>

        {isLoading ? (
          <View style={styles.empty}>
            <ActivityIndicator color={GlassTheme.primary} />
          </View>
        ) : !students || students.length === 0 ? (
          <EmptyMessage
            icon="people-outline"
            title="No students yet"
            sub="Add students to a class first, then come back to record a session."
          />
        ) : filteredStudents.length === 0 ? (
          <EmptyMessage
            icon="search-outline"
            title="No matches"
            sub={`No students match "${searchQuery}".`}
          />
        ) : (
          <FlatList
            data={filteredStudents}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => router.push(`/student/${item.id}/new-session`)}
                style={({ pressed }) => [styles.cardWrap, pressed && { opacity: 0.7 }]}
              >
                <GlassCard radius={18}>
                  <View style={styles.row}>
                    <GlassAvatar
                      name={item.name}
                      size={44}
                      color={STUDENT_PALETTE[index % STUDENT_PALETTE.length]}
                    />
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle}>{item.name}</Text>
                      <Text style={styles.rowSub}>{item.email}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={GlassTheme.inkSubtle}
                    />
                  </View>
                </GlassCard>
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        )}
      </SafeAreaView>
    </AmbientBackground>
  );
}

function EmptyMessage({
  icon,
  title,
  sub,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  sub: string;
}) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={44} color={GlassTheme.inkSubtle} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 18, paddingTop: 8 },
  eyebrow: {
    fontSize: 12,
    color: GlassTheme.inkSubtle,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  title: {
    fontFamily: GlassFonts.display,
    fontSize: 36,
    color: GlassTheme.ink,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  sub: { fontSize: 14, color: GlassTheme.inkMuted, marginTop: 4 },

  searchCard: { marginHorizontal: 18, marginTop: 16 },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: GlassTheme.ink, height: '100%' },

  listContent: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 120 },
  cardWrap: {},
  row: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: GlassTheme.ink },
  rowSub: { fontSize: 12, color: GlassTheme.inkMuted, marginTop: 2 },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: GlassTheme.ink,
    marginTop: 4,
  },
  emptySub: {
    fontSize: 13,
    color: GlassTheme.inkMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
