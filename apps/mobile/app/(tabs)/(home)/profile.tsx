import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground, GlassCard } from '@/components/glass';
import { GlassFonts, GlassTheme } from '@/constants/glass-theme';
import { useAuth } from '@/lib/auth/context';
import { api } from '@/lib/trpc/client';

type IconName = keyof typeof Ionicons.glyphMap;
type Row = { icon: IconName; label: string; detail?: string; onPress?: () => void };
type Section = { header: string; rows: Row[] };

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const isTeacher = user?.role === 'TEACHER';

  const { data: students } = api.teachers.getMyStudents.useQuery(undefined, {
    enabled: isTeacher,
  });
  const { data: programs } = api.teachers.getMyPrograms.useQuery(undefined, {
    enabled: isTeacher,
  });

  const initials = useMemo(() => {
    const source = user?.name || user?.email || 'You';
    return source
      .split(/[\s@]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]!.toUpperCase())
      .join('');
  }, [user?.name, user?.email]);

  const stats = useMemo(() => {
    const studentCount = students?.length ?? 0;
    const classCount = programs?.flatMap((p) => p.classes ?? []).length ?? 0;
    return [
      { label: 'Students', value: String(studentCount) },
      { label: 'Classes', value: String(classCount) },
      { label: 'Programs', value: String(programs?.length ?? 0) },
    ];
  }, [students, programs]);

  const sections: Section[] = useMemo(() => {
    const account: Section = {
      header: 'ACCOUNT',
      rows: [
        { icon: 'person-outline', label: 'Edit profile' },
        ...(isTeacher
          ? ([
              { icon: 'people-outline', label: 'My students', detail: `${stats[0]!.value} active` },
              { icon: 'school-outline', label: 'My classes', detail: `${stats[1]!.value} total` },
            ] as Row[])
          : []),
        { icon: 'notifications-outline', label: 'Notifications', detail: 'All enabled' },
        { icon: 'lock-closed-outline', label: 'Privacy & security' },
      ],
    };
    const prefs: Section = {
      header: 'PREFERENCES',
      rows: [
        { icon: 'book-outline', label: 'Mushaf edition', detail: 'Madani 15-line' },
        { icon: 'settings-outline', label: 'App settings' },
      ],
    };
    const app: Section = {
      header: 'APP',
      rows: [
        { icon: 'help-circle-outline', label: 'Help & support', onPress: () => router.push('/help') },
        { icon: 'information-circle-outline', label: 'About', onPress: () => router.push('/about') },
      ],
    };
    return [account, prefs, app];
  }, [isTeacher, stats, router]);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={6}
            style={styles.headerButtonPress}
          >
            <GlassCard radius={12} fillColor="rgba(255,255,255,0.5)">
              <View style={styles.headerButton}>
                <Ionicons name="chevron-back" size={18} color={GlassTheme.ink} />
              </View>
            </GlassCard>
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* avatar + name hero */}
          <View style={styles.hero}>
            <View style={styles.avatarWrap}>
              <LinearGradient
                colors={[GlassTheme.primary, withAlpha(GlassTheme.primary, 0.73)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{initials || 'You'}</Text>
              </LinearGradient>
              <View style={styles.editBadge}>
                <Ionicons name="pencil" size={12} color="#fff" />
              </View>
            </View>

            <Text style={styles.name} numberOfLines={1}>
              {user?.name || 'You'}
            </Text>
            {user?.email && <Text style={styles.email}>{user.email}</Text>}
            {user?.role && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user.role}</Text>
              </View>
            )}

            {/* stats */}
            <GlassCard radius={20} fillColor="rgba(255,255,255,0.55)" style={styles.statsCard}>
              <View style={styles.statsRow}>
                {stats.map((s, i) => (
                  <View
                    key={s.label}
                    style={[
                      styles.statCell,
                      i < stats.length - 1 && styles.statDivider,
                    ]}
                  >
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </View>

          {/* sections */}
          {sections.map((sec) => (
            <View key={sec.header} style={styles.section}>
              <Text style={styles.sectionHeader}>{sec.header}</Text>
              <GlassCard radius={20} fillColor="rgba(255,255,255,0.55)">
                {sec.rows.map((row, ri) => (
                  <Pressable
                    key={row.label}
                    onPress={row.onPress}
                    style={[
                      styles.row,
                      ri < sec.rows.length - 1 && styles.rowDivider,
                    ]}
                  >
                    <View style={styles.rowIcon}>
                      <Ionicons name={row.icon} size={17} color={GlassTheme.primary} />
                    </View>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                    {row.detail && <Text style={styles.rowDetail}>{row.detail}</Text>}
                    <Ionicons
                      name="chevron-forward"
                      size={15}
                      color={GlassTheme.inkSubtle}
                    />
                  </Pressable>
                ))}
              </GlassCard>
            </View>
          ))}

          {/* sign out */}
          <Pressable onPress={handleSignOut} style={styles.signOutPress}>
            <View style={styles.signOut}>
              <Text style={styles.signOutText}>Sign out</Text>
            </View>
          </Pressable>

          <Text style={styles.version}>HifzHub v1.0.0</Text>

          <View style={{ height: 28 }} />
        </ScrollView>
      </SafeAreaView>
    </AmbientBackground>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 6,
    gap: 12,
  },
  headerButtonPress: {},
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: GlassTheme.ink,
  },
  headerSpacer: { width: 36 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 24 },

  hero: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GlassTheme.primary,
    shadowOpacity: 0.27,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GlassTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  name: {
    fontFamily: GlassFonts.display,
    fontSize: 28,
    fontWeight: '500',
    letterSpacing: -0.4,
    color: GlassTheme.ink,
    marginTop: 14,
    lineHeight: 32,
  },
  email: {
    fontSize: 13,
    color: GlassTheme.inkMuted,
    marginTop: 4,
  },
  roleBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: GlassTheme.primarySoft,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: GlassTheme.primary,
    letterSpacing: 0.6,
  },

  statsCard: {
    marginTop: 22,
    alignSelf: 'stretch',
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: 14,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  statDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: GlassTheme.line,
  },
  statValue: {
    fontFamily: GlassFonts.display,
    fontSize: 22,
    fontWeight: '500',
    color: GlassTheme.primary,
  },
  statLabel: {
    fontSize: 10,
    color: GlassTheme.inkSubtle,
    marginTop: 3,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  section: { marginTop: 24 },
  sectionHeader: {
    fontSize: 11,
    color: GlassTheme.inkSubtle,
    fontWeight: '600',
    letterSpacing: 0.8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GlassTheme.line,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: GlassTheme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: GlassTheme.ink,
  },
  rowDetail: {
    fontSize: 13,
    color: GlassTheme.inkSubtle,
  },

  signOutPress: { marginTop: 28 },
  signOut: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(199,93,44,0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(199,93,44,0.2)',
  },
  signOutText: {
    color: '#c75d2c',
    fontWeight: '600',
    fontSize: 15,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: GlassTheme.inkSubtle,
    marginTop: 18,
  },
});
