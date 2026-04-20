import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AmbientBackground,
  GlassAvatar,
  GlassCard,
  SectionLabel,
} from '@/components/glass';
import { NotificationsSheet } from '@/components/notifications/notifications-sheet';
import { GlassFonts, GlassTheme } from '@/constants/glass-theme';
import { useAuth } from '@/lib/auth/context';
import { api } from '@/lib/trpc/client';

const STUDENT_PALETTE = [
  '#4a5d3a', '#b88835', '#7b5a8e', '#a0522d', '#2e5a5a', '#3a5577',
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: programs, isLoading: programsLoading, refetch: refetchPrograms } =
    api.teachers.getMyPrograms.useQuery(undefined, { enabled: user?.role === 'TEACHER' });
  const { data: students, isLoading: studentsLoading, refetch: refetchStudents } =
    api.teachers.getMyStudents.useQuery(undefined, { enabled: user?.role === 'TEACHER' });

  const isLoading = programsLoading || studentsLoading;

  const [createClassVisible, setCreateClassVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  const initials = useMemo(() => {
    const source = user?.name || user?.email || 'You';
    return source
      .split(/[\s@]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]!.toUpperCase())
      .join('');
  }, [user?.name, user?.email]);

  const unreadNotifications = 2;

  const createClass = api.teachers.createClass.useMutation({
    onSuccess: () => {
      setCreateClassVisible(false);
      refetchPrograms();
      refetchStudents();
    },
    onError: (error) => {
      Alert.alert('Could not create class', error.message);
    },
  });

  const allClasses = useMemo(
    () =>
      programs?.flatMap(
        (program) =>
          program.classes?.map((c) => ({ ...c, programName: program.name })) || [],
      ) || [],
    [programs],
  );

  const heroClass = allClasses[0];
  const laterClasses = allClasses.slice(1, 4);

  const greetingDate = useMemo(() => {
    const now = new Date();
    let hijri: string;
    try {
      hijri = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
      }).format(now);
    } catch {
      hijri = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
    }
    return {
      weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
      sub: hijri,
    };
  }, []);

  const handleRefresh = () => {
    refetchPrograms();
    refetchStudents();
  };

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={GlassTheme.primary} />
          }
        >
          {/* Top bar — profile (left) + notifications (right) */}
          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.push('/(tabs)/(home)/profile')}
              hitSlop={6}
              style={styles.topAvatarPress}
            >
              <LinearGradient
                colors={[GlassTheme.primary, withAlpha(GlassTheme.primary, 0.73)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.topAvatar}
              >
                <Text style={styles.topAvatarText}>{initials || 'You'}</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => setNotificationsVisible(true)}
              hitSlop={6}
              style={styles.bellPress}
            >
              <GlassCard radius={20} fillColor="rgba(255,255,255,0.55)">
                <View style={styles.bellInner}>
                  <Ionicons name="notifications-outline" size={20} color={GlassTheme.ink} />
                </View>
              </GlassCard>
              {unreadNotifications > 0 && <View style={styles.bellDot} />}
            </Pressable>
          </View>

          {/* Greeting */}
          <View style={styles.greeting}>
            <Text style={styles.greetingEyebrow}>ASSALĀMU ʿALAYKUM</Text>
            <Text style={styles.greetingTitle}>
              {greetingDate.weekday}
              {'\n'}
              <Text style={styles.greetingSub}>{greetingDate.sub}</Text>
            </Text>
          </View>

          {/* Hero — first class or empty state */}
          {heroClass ? (
            <HeroClassCard
              name={heroClass.name}
              programName={heroClass.programName}
              studentNames={(heroClass.students || [])
                .map((s) => s.student?.name)
                .filter((n): n is string => Boolean(n))}
              onStart={() =>
                router.push({
                  pathname: '/(tabs)/(home)/class/[id]',
                  params: { id: heroClass.id },
                })
              }
            />
          ) : isLoading ? (
            <GlassCard radius={28} style={styles.heroLoading}>
              <ActivityIndicator color={GlassTheme.primary} />
            </GlassCard>
          ) : (
            <EmptyHero
              name={user?.name ?? 'teacher'}
              onCreate={() => setCreateClassVisible(true)}
            />
          )}

          {/* Quick actions */}
          <View style={styles.actionsRow}>
            <QuickAction
              icon="add"
              label="Assign work"
              tintTop="#d6a85a"
              tintBottom={GlassTheme.accent}
              onPress={() => router.push('/(tabs)/new-session')}
            />
            <QuickAction
              icon="megaphone"
              label="Announce"
              tintTop="#6a7d57"
              tintBottom={GlassTheme.primary}
              onPress={() => router.push('/(tabs)/(home)/announcements')}
            />
          </View>

          {/* Other classes */}
          {laterClasses.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <SectionLabel>LATER TODAY</SectionLabel>
                <Pressable onPress={() => router.push('/(tabs)/(home)/classes')} hitSlop={8}>
                  <Text style={styles.seeAll}>See all</Text>
                </Pressable>
              </View>
              <GlassCard radius={22}>
                {laterClasses.map((c, i) => (
                  <Pressable
                    key={c.id}
                    onPress={() =>
                      router.push({
                        pathname: '/(tabs)/(home)/class/[id]',
                        params: { id: c.id },
                      })
                    }
                    style={[
                      styles.row,
                      i < laterClasses.length - 1 && styles.rowDivider,
                    ]}
                  >
                    <View style={styles.rowIconBubble}>
                      <Ionicons name="school" size={18} color={GlassTheme.primary} />
                    </View>
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle}>{c.name}</Text>
                      <Text style={styles.rowSub}>
                        {c.students?.length ?? 0} students · {c.programName}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={GlassTheme.inkSubtle} />
                  </Pressable>
                ))}
              </GlassCard>
            </View>
          )}

          {/* Students roster */}
          {students && students.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <SectionLabel>MY STUDENTS</SectionLabel>
                <Pressable onPress={() => router.push('/(tabs)/(home)/students')} hitSlop={8}>
                  <Text style={styles.seeAll}>See all</Text>
                </Pressable>
              </View>
              <GlassCard radius={22}>
                {students.slice(0, 5).map((s, i, arr) => (
                  <Pressable
                    key={s.id}
                    onPress={() =>
                      router.push({
                        pathname: '/(tabs)/(home)/student/[id]',
                        params: { id: s.id },
                      })
                    }
                    style={[
                      styles.row,
                      i < arr.length - 1 && styles.rowDivider,
                    ]}
                  >
                    <GlassAvatar
                      name={s.name}
                      size={42}
                      color={STUDENT_PALETTE[i % STUDENT_PALETTE.length]}
                    />
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle}>{s.name}</Text>
                      <Text style={styles.rowSub}>{s.email}</Text>
                    </View>
                    {/* Open Quran reader in student-marking mode */}
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: '/(tabs)/reader',
                          params: { studentId: s.id, studentName: s.name ?? '' },
                        })
                      }
                      hitSlop={8}
                      style={styles.readerBtn}
                    >
                      <Ionicons name="book-outline" size={18} color={GlassTheme.primary} />
                    </Pressable>
                  </Pressable>
                ))}
              </GlassCard>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      <CreateClassModal
        visible={createClassVisible}
        submitting={createClass.isPending}
        onClose={() => setCreateClassVisible(false)}
        onSubmit={(name) => createClass.mutate({ name })}
      />

      <NotificationsSheet
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />
    </AmbientBackground>
  );
}

function CreateClassModal({
  visible,
  submitting,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState('');

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalRoot}
      >
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalGrabber} />
          <Text style={styles.modalEyebrow}>NEW CLASS</Text>
          <Text style={styles.modalTitle}>Name your first class</Text>
          <Text style={styles.modalSub}>
            We&apos;ll create a default program to hold it. You can add students after.
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Hifz Group A"
            placeholderTextColor={GlassTheme.inkSubtle}
            style={styles.modalInput}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={submit}
            editable={!submitting}
          />
          <View style={styles.modalActions}>
            <Pressable
              onPress={onClose}
              style={styles.modalSecondary}
              disabled={submitting}
            >
              <Text style={styles.modalSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={submit}
              disabled={submitting || !name.trim()}
              style={[styles.modalPrimaryWrap, (!name.trim() || submitting) && { opacity: 0.5 }]}
            >
              <LinearGradient
                colors={[GlassTheme.primaryGlass, GlassTheme.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalPrimary}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalPrimaryText}>Create</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function HeroClassCard({
  name,
  programName,
  studentNames,
  onStart,
}: {
  name: string;
  programName?: string;
  studentNames: string[];
  onStart: () => void;
}) {
  return (
    <View style={styles.heroWrap}>
<GlassCard
        radius={28}
        fillColor={GlassTheme.primaryGlass}
        borderColor="rgba(255,255,255,0.3)"
        style={styles.heroCard}
      >
        <View style={styles.heroEyebrowRow}>
          <View style={styles.heroDot} />
          <Text style={styles.heroEyebrow}>NEXT SESSION</Text>
        </View>
        <Text style={styles.heroTitle}>{name}</Text>
        {programName ? <Text style={styles.heroSub}>{programName}</Text> : null}

        {studentNames.length > 0 && (
          <View style={styles.avatarStack}>
            {studentNames.slice(0, 4).map((n, i) => (
              <View key={`${n}-${i}`} style={[styles.stackItem, { marginLeft: i === 0 ? 0 : -10 }]}>
                <GlassAvatar
                  name={n}
                  size={32}
                  color={STUDENT_PALETTE[i % STUDENT_PALETTE.length]}
                />
              </View>
            ))}
            <Text style={styles.avatarStackLabel}>
              {studentNames.length} {studentNames.length === 1 ? 'student' : 'students'}
            </Text>
          </View>
        )}

        <Pressable onPress={onStart} style={styles.heroCta}>
          <Ionicons name="play" size={14} color={GlassTheme.ink} />
          <Text style={styles.heroCtaLabel}>Start session</Text>
        </Pressable>
      </GlassCard>
    </View>
  );
}

function EmptyHero({ name, onCreate }: { name: string; onCreate: () => void }) {
  return (
    <View style={styles.heroWrap}>
<GlassCard radius={28} fillColor={GlassTheme.primaryGlass} borderColor="rgba(255,255,255,0.3)" style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>WELCOME</Text>
        <Text style={styles.heroTitle}>{name}</Text>
        <Text style={styles.heroSub}>Set up a class to get started.</Text>
        <Pressable onPress={onCreate} style={styles.heroCta}>
          <Ionicons name="add" size={14} color={GlassTheme.ink} />
          <Text style={styles.heroCtaLabel}>Create class</Text>
        </Pressable>
      </GlassCard>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  tintTop,
  tintBottom,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tintTop: string;
  tintBottom: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.actionPress}>
      <GlassCard radius={20}>
        <View style={styles.actionInner}>
          <LinearGradient
            colors={[tintTop, tintBottom]}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={styles.actionIcon}
          >
            <Ionicons name={icon} size={16} color="#fff" />
          </LinearGradient>
          <Text style={styles.actionLabel}>{label}</Text>
        </View>
      </GlassCard>
    </Pressable>
  );
}

function withAlpha(hex: string, alpha: number): string {
  const sanitized = hex.replace('#', '');
  if (sanitized.length !== 6) return hex;
  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 4, paddingBottom: 24 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  topAvatarPress: {},
  topAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  topAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bellPress: { position: 'relative' },
  bellInner: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: GlassTheme.accent,
    borderWidth: 1.5,
    borderColor: GlassTheme.bg,
  },

  greeting: { paddingTop: 4 },
  greetingEyebrow: {
    fontSize: 12,
    color: GlassTheme.inkSubtle,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  greetingTitle: {
    fontFamily: GlassFonts.display,
    fontSize: 38,
    lineHeight: 42,
    color: GlassTheme.ink,
    marginTop: 6,
    fontWeight: '500',
    letterSpacing: -0.6,
  },
  greetingSub: {
    fontFamily: GlassFonts.displayItalic,
    color: GlassTheme.inkMuted,
  },

  heroWrap: { marginTop: 22, position: 'relative' },
  heroCard: { padding: 22 },
  heroLoading: { padding: 40, alignItems: 'center' },
  heroEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GlassTheme.accent,
  },
  heroEyebrow: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1,
    fontWeight: '600',
  },
  heroTitle: {
    fontFamily: GlassFonts.display,
    fontSize: 30,
    color: '#fff',
    marginTop: 8,
    lineHeight: 33,
    fontWeight: '500',
    letterSpacing: -0.4,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },

  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  stackItem: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarStackLabel: {
    marginLeft: 10,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    alignSelf: 'center',
  },

  heroCta: {
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  heroCtaLabel: {
    fontWeight: '600',
    fontSize: 15,
    color: GlassTheme.ink,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionPress: { flex: 1 },
  actionInner: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: GlassTheme.ink,
  },

  section: { marginTop: 26 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  seeAll: { color: GlassTheme.primary, fontSize: 13, fontWeight: '600' },

  row: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GlassTheme.line,
  },
  rowIconBubble: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: GlassTheme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: GlassTheme.ink },
  rowSub: { fontSize: 12, color: GlassTheme.inkMuted, marginTop: 2 },
  readerBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: GlassTheme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28,30,20,0.45)',
  },
  modalSheet: {
    backgroundColor: GlassTheme.surfaceSolid,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 36,
    gap: 12,
  },
  modalGrabber: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: GlassTheme.inkSubtle,
    opacity: 0.3,
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: GlassTheme.inkSubtle,
  },
  modalTitle: {
    fontFamily: GlassFonts.display,
    fontSize: 26,
    fontWeight: '500',
    color: GlassTheme.ink,
    letterSpacing: -0.4,
  },
  modalSub: {
    fontSize: 13,
    color: GlassTheme.inkMuted,
    lineHeight: 18,
  },
  modalInput: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 0.5,
    borderColor: GlassTheme.cardBorder,
    fontSize: 16,
    color: GlassTheme.ink,
    marginTop: 6,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: GlassTheme.primarySoft,
    alignItems: 'center',
  },
  modalSecondaryText: {
    color: GlassTheme.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  modalPrimaryWrap: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  modalPrimary: {
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  modalPrimaryText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
