import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { AmbientBackground, GlassAvatar, GlassCard, SectionLabel } from '@/components/glass';
import { GlassFonts, GlassTheme } from '@/constants/glass-theme';
import { api } from '@/lib/trpc/client';

const STUDENT_COLOR = GlassTheme.primary;
const RING_R = 38;
const RING_CIRC = 2 * Math.PI * RING_R;

// 18 scroll padding each side + 14 grid padding each side + 6 gaps of 5px
const SCREEN_W = Dimensions.get('window').width;
const HEATMAP_CELL = Math.floor((SCREEN_W - 36 - 28 - 30) / 7);

// ── Root screen ───────────────────────────────────────────────────────────────

export default function StudentProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'progress' | 'sessions' | 'parent'>('progress');

  const { data: profile, isLoading, refetch, isRefetching } =
    api.students.getProfile.useQuery({ studentId: id }, { enabled: !!id });

  const { data: mistakesData } =
    api.students.getWordMistakes.useQuery({ studentId: id }, { enabled: !!id });

  const { data: sessionHistory } =
    api.students.getSessionHistory.useQuery(
      { studentId: id, limit: 28 },
      { enabled: !!id },
    );

  const heatmap = useMemo(() => {
    const sArr = sessionHistory?.sessions ?? [];
    const today = new Date();
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (27 - i));
      const ds = d.toDateString();
      return sArr.some((s) => new Date(s.date).toDateString() === ds) ? 1 : 0;
    });
  }, [sessionHistory]);

  const mistakeCounts = useMemo(() => ({
    memory:   mistakesData?.mistakes?.filter((m) => m.mistakeType === 'memory').length ?? 0,
    tashkeel: mistakesData?.mistakes?.filter((m) => m.mistakeType === 'tashkeel').length ?? 0,
    tajweed:  mistakesData?.mistakes?.filter((m) => m.mistakeType === 'tajweed').length ?? 0,
  }), [mistakesData]);

  if (isLoading) {
    return (
      <AmbientBackground>
        <View style={[styles.center, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color={GlassTheme.primary} />
        </View>
      </AmbientBackground>
    );
  }

  if (!profile) {
    return (
      <AmbientBackground>
        <View style={[styles.center, { paddingTop: insets.top }]}>
          <Ionicons name="person-outline" size={48} color={GlassTheme.inkSubtle} />
          <Text style={styles.emptyText}>Student not found</Text>
        </View>
      </AmbientBackground>
    );
  }

  const pct = profile.quranProgress.completionPercentage ?? 0;
  const strokeOffset = RING_CIRC * (1 - pct / 100);
  const practiceCount = heatmap.filter(Boolean).length;
  const latestAssignment = profile.recentSessions[0]?.assignments[0] ?? null;

  return (
    <AmbientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={GlassTheme.primary} />
        }
      >
        {/* ── Back ───────────────────────────────────────────────────────── */}
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={18} color={GlassTheme.ink} />
        </Pressable>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <View style={styles.hero}>
          {/* Avatar with SVG progress ring */}
          <View style={styles.ringWrap}>
            <View style={styles.ringSvgWrap}>
              <Svg width={84} height={84}>
                <Circle cx={42} cy={42} r={RING_R} stroke={GlassTheme.line} strokeWidth={4} fill="none" />
                <Circle
                  cx={42} cy={42} r={RING_R}
                  stroke={STUDENT_COLOR}
                  strokeWidth={4}
                  fill="none"
                  strokeDasharray={RING_CIRC}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  rotation={-90}
                  origin="42,42"
                />
              </Svg>
            </View>
            <View style={styles.avatarCenter}>
              <GlassAvatar name={profile.name ?? '?'} size={72} color={STUDENT_COLOR} />
            </View>
          </View>

          {/* Name & details */}
          <View style={styles.heroInfo}>
            <Text style={styles.heroName} numberOfLines={2}>{profile.name}</Text>
            <Text style={styles.heroSub} numberOfLines={1}>
              {profile.programs.length > 0 ? profile.programs[0]!.name : 'Student'}
              {' · Juz '}{profile.quranProgress.currentJuz}
            </Text>
            <View style={styles.pills}>
              <View style={styles.pill}>
                <Ionicons name="flame" size={12} color={GlassTheme.accent} />
                <Text style={styles.pillText}>{profile.stats.totalSessions}d</Text>
              </View>
              <View style={styles.pill}>
                <Ionicons name="book-outline" size={12} color={STUDENT_COLOR} />
                <Text style={styles.pillText}>{pct}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Quick actions ───────────────────────────────────────────────── */}
        <View style={styles.actionsRow}>
          <ActionBtn
            label="Open Quran"
            icon="book-outline"
            color={GlassTheme.primary}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/reader',
                params: { studentId: id, studentName: profile.name ?? '' },
              })
            }
          />
          <ActionBtn
            label="New Session"
            icon="add-circle-outline"
            color={GlassTheme.accent}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/(home)/student/[id]/new-session',
                params: { id },
              })
            }
          />
          <ActionBtn
            label="Message"
            icon="chatbubble-outline"
            color={GlassTheme.inkMuted}
            onPress={() => profile.email && Linking.openURL(`mailto:${profile.email}`)}
          />
        </View>

        {/* ── Segmented tabs ──────────────────────────────────────────────── */}
        <View style={styles.tabBar}>
          {(['progress', 'sessions', 'parent'] as const).map((t) => (
            <Pressable
              key={t}
              style={[styles.tabItem, activeTab === t && styles.tabItemActive]}
              onPress={() => setActiveTab(t)}
            >
              {activeTab === t ? (
                <LinearGradient
                  colors={[GlassTheme.primaryGlass, GlassTheme.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
              <Text style={[styles.tabLabel, activeTab === t && styles.tabLabelActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Tab content ─────────────────────────────────────────────────── */}
        {activeTab === 'progress' && (
          <ProgressTab
            profile={profile}
            pct={pct}
            heatmap={heatmap}
            practiceCount={practiceCount}
            latestAssignment={latestAssignment}
          />
        )}
        {activeTab === 'sessions' && (
          <SessionsTab
            sessions={sessionHistory?.sessions.slice(0, 5) ?? profile.recentSessions.slice(0, 5)}
            mistakeCounts={mistakeCounts}
            mistakesData={mistakesData ?? null}
          />
        )}
        {activeTab === 'parent' && (
          <ParentTab parents={profile.parents} />
        )}

        {/* ── Details & Notes ─────────────────────────────────────────────── */}
        {activeTab === 'progress' && (
          <>
            <SectionLabel>DETAILS</SectionLabel>
            <GlassCard radius={20} style={styles.section}>
              <InfoRow label="Member since" value={new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />
              <InfoRow
                label="Enrolled"
                value={new Date(profile.enrollmentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                divider
              />
              {!!profile.phone && <InfoRow label="Phone" value={profile.phone} divider />}
              {!!profile.preferredSessionTime && (
                <InfoRow label="Preferred time" value={profile.preferredSessionTime} divider />
              )}
            </GlassCard>

            {!!profile.notes && (
              <>
                <SectionLabel>NOTES</SectionLabel>
                <GlassCard radius={20} style={[styles.section, { padding: 16 }]}>
                  <Text style={styles.notesText}>{profile.notes}</Text>
                </GlassCard>
              </>
            )}
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </AmbientBackground>
  );
}

// ── Progress tab ──────────────────────────────────────────────────────────────

function ProgressTab({
  profile, pct, heatmap, practiceCount, latestAssignment,
}: {
  profile: any;
  pct: number;
  heatmap: number[];
  practiceCount: number;
  latestAssignment: any;
}) {
  return (
    <>
      {/* Current assignment */}
      {latestAssignment && (
        <>
          <SectionLabel>CURRENT ASSIGNMENT</SectionLabel>
          <GlassCard
            radius={20}
            style={[styles.section, { borderColor: STUDENT_COLOR + '33', borderWidth: 1 }]}
            fillColor={STUDENT_COLOR + '12'}
          >
            <View style={styles.assignRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.assignType}>{assignLabel(latestAssignment.type)}</Text>
                <Text style={styles.assignSurah}>
                  Surah {latestAssignment.startSurah}
                </Text>
                <Text style={styles.assignVerse}>
                  Verses {latestAssignment.startAyah}–{latestAssignment.endAyah}
                </Text>
              </View>
              <StatusBadge status={latestAssignment.status} />
            </View>
            {latestAssignment.ayahCount > 0 && (
              <View style={styles.assignProgress}>
                <View style={styles.assignBarBg}>
                  <View style={[styles.assignBarFill, { width: '40%' }]} />
                </View>
                <Text style={styles.assignProgressLabel}>{latestAssignment.ayahCount} ayahs</Text>
              </View>
            )}
          </GlassCard>
        </>
      )}

      {/* Hifz progress stats */}
      <SectionLabel>HIFZ PROGRESS</SectionLabel>
      <GlassCard radius={20} style={styles.section}>
        <View style={styles.statsInner}>
          <View style={styles.progressRingWrap}>
            <Svg width={80} height={80}>
              <Circle cx={40} cy={40} r={34} stroke={GlassTheme.line} strokeWidth={4} fill="none" />
              <Circle
                cx={40} cy={40} r={34}
                stroke={STUDENT_COLOR}
                strokeWidth={4}
                fill="none"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - pct / 100)}
                strokeLinecap="round"
                rotation={-90}
                origin="40,40"
              />
            </Svg>
            <View style={styles.progressRingCenter}>
              <Text style={styles.progressPct}>{pct}</Text>
              <Text style={styles.progressPctSign}>%</Text>
            </View>
          </View>
          <View style={styles.statsCol}>
            <ProgressStat value={profile.quranProgress.totalJuzCompleted} label="Juz done" sub="of 30" color={STUDENT_COLOR} />
            <View style={styles.statDivider} />
            <ProgressStat value={`Juz ${profile.quranProgress.currentJuz}`} label="Current" color={GlassTheme.accent} />
            <View style={styles.statDivider} />
            <ProgressStat value={profile.quranProgress.totalAyahsMemorized} label="Ayahs" color="#6a7d57" />
          </View>
        </View>
      </GlassCard>

      {/* 28-day activity heatmap */}
      <SectionLabel>28-DAY ACTIVITY</SectionLabel>
      <GlassCard radius={20} style={styles.section}>
        <View style={styles.heatmapGrid}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text key={i} style={styles.heatmapDay}>{d}</Text>
          ))}
          {heatmap.map((v, i) => (
            <View
              key={i}
              style={[
                styles.heatmapCell,
                v ? { backgroundColor: STUDENT_COLOR, opacity: 1 } : { backgroundColor: 'rgba(255,255,255,0.35)' },
              ]}
            />
          ))}
        </View>
        <View style={styles.heatmapFooter}>
          <Text style={styles.heatmapSub}>{practiceCount}/28 days practiced</Text>
          <View style={styles.heatmapStreak}>
            <Ionicons name="flame" size={12} color={GlassTheme.accent} />
            <Text style={styles.heatmapStreakText}>{practiceCount} recent</Text>
          </View>
        </View>
      </GlassCard>

      {/* Goals */}
      {(profile.goals.semester || profile.goals.annual || profile.goals.custom.length > 0) && (
        <>
          <SectionLabel>GOALS</SectionLabel>
          <GlassCard radius={20} style={styles.section}>
            {[
              profile.goals.semester && { ...profile.goals.semester, typeLabel: 'Semester' },
              profile.goals.annual && { ...profile.goals.annual, typeLabel: 'Annual' },
              ...profile.goals.custom.map((g: any) => ({ ...g, typeLabel: 'Custom' })),
            ]
              .filter(Boolean)
              .map((goal: any, i: number, arr: any[]) => {
                const gPct = goal.targetAyahs
                  ? Math.min(100, Math.round((goal.currentProgress / goal.targetAyahs) * 100))
                  : 0;
                return (
                  <View key={goal.id} style={[styles.goalRow, i < arr.length - 1 && styles.goalDivider]}>
                    <View style={styles.goalHeader}>
                      <View style={styles.goalBadge}>
                        <Text style={styles.goalBadgeText}>{goal.typeLabel}</Text>
                      </View>
                      <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
                      <Text style={styles.goalPct}>{gPct}%</Text>
                    </View>
                    <View style={styles.goalBarBg}>
                      <View style={[styles.goalBarFill, { width: `${gPct}%` as any }]} />
                    </View>
                    {goal.endDate && (
                      <Text style={styles.goalDue}>
                        Due {new Date(goal.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    )}
                  </View>
                );
              })}
          </GlassCard>
        </>
      )}

      {/* Session stats 2×2 */}
      <SectionLabel>SESSION STATS</SectionLabel>
      <View style={[styles.statGrid, styles.section]}>
        <StatTile icon="calendar-outline" value={profile.stats.totalSessions} label="Total" color={STUDENT_COLOR} />
        <StatTile icon="book-outline" value={profile.stats.totalHifzSessions} label="New Hifz" color="#6a7d57" />
        <StatTile icon="refresh-outline" value={profile.stats.totalReviewSessions} label="Reviews" color={GlassTheme.accent} />
        <StatTile
          icon="star-outline"
          value={profile.stats.averageQuality ? `${profile.stats.averageQuality}/5` : '—'}
          label="Avg Quality"
          color="#b88835"
        />
      </View>
    </>
  );
}

// ── Sessions tab ──────────────────────────────────────────────────────────────

function SessionsTab({
  sessions,
  mistakeCounts,
  mistakesData,
}: {
  sessions: any[];
  mistakeCounts: { memory: number; tashkeel: number; tajweed: number };
  mistakesData: { mistakes: any[]; recordedAt: Date | string | null } | null;
}) {
  const hasMistakes = (mistakesData?.mistakes?.length ?? 0) > 0;

  return (
    <>
      {hasMistakes && (
        <>
          <SectionLabel>LATEST REVIEW</SectionLabel>
          <GlassCard radius={20} style={styles.section}>
            <View style={styles.mistakeRow}>
              {Object.entries(mistakeCounts).map(([key, n]) => {
                const meta = GlassTheme.mistake[key as keyof typeof GlassTheme.mistake];
                return (
                  <View key={key} style={styles.mistakeItem}>
                    <View style={[styles.mistakeDot, { backgroundColor: meta.color }]} />
                    <Text style={[styles.mistakeCount, { color: meta.color }]}>{n}</Text>
                    <Text style={styles.mistakeLabel}>{meta.short}</Text>
                  </View>
                );
              })}
            </View>
            {mistakesData?.recordedAt && (
              <Text style={styles.mistakeDate}>
                Recorded {new Date(mistakesData.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            )}
          </GlassCard>
        </>
      )}

      <SectionLabel>RECENT SESSIONS</SectionLabel>
      <GlassCard radius={20} style={styles.section}>
        {sessions.length === 0 ? (
          <View style={styles.emptySession}>
            <Ionicons name="calendar-outline" size={28} color={GlassTheme.inkSubtle} />
            <Text style={styles.emptySessionText}>No sessions yet</Text>
          </View>
        ) : (
          sessions.map((s: any, i: number) => (
            <View
              key={s.id}
              style={[styles.sessionRow, i < sessions.length - 1 && styles.sessionDivider]}
            >
              {/* Attendance dot */}
              <View style={[
                styles.attendDot,
                { backgroundColor: s.attendance === 'PRESENT' ? GlassTheme.primary : s.attendance === 'ABSENT' ? GlassTheme.error : GlassTheme.accent },
              ]} />

              <View style={styles.sessionBody}>
                <Text style={styles.sessionSurah} numberOfLines={1}>
                  {/* getSessionHistory has startSurah/endSurah; getProfile has assignments */}
                  {s.startSurah != null
                    ? `Surah ${s.startSurah}:${s.startAyah ?? 1} – ${s.endSurah}:${s.endAyah ?? '?'}`
                    : s.assignments?.length > 0
                    ? `${assignLabel(s.assignments[0].type)} · S${s.assignments[0].startSurah}:${s.assignments[0].startAyah}`
                    : 'Session'}
                </Text>
                <Text style={styles.sessionDate}>
                  {new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </Text>
              </View>

              <View style={styles.sessionRight}>
                {s.qualityRating > 0 && (
                  <View style={styles.qualityPill}>
                    <Ionicons name="star" size={9} color={GlassTheme.accent} />
                    <Text style={styles.qualityText}>{s.qualityRating}/5</Text>
                  </View>
                )}
                <AttendanceBadge status={s.attendance} />
              </View>
            </View>
          ))
        )}
      </GlassCard>
    </>
  );
}

// ── Parent tab ────────────────────────────────────────────────────────────────

function ParentTab({ parents }: { parents: any[] }) {
  if (parents.length === 0) {
    return (
      <GlassCard radius={20} style={[styles.section, styles.emptyParent]}>
        <Ionicons name="people-outline" size={32} color={GlassTheme.inkSubtle} />
        <Text style={styles.emptyParentText}>No parent contacts on file</Text>
      </GlassCard>
    );
  }

  return (
    <>
      <SectionLabel>PARENT / GUARDIAN</SectionLabel>
      {parents.map((p: any) => (
        <GlassCard key={p.id} radius={20} style={styles.section}>
          <View style={styles.parentHeader}>
            <GlassAvatar name={p.name ?? '?'} size={50} color="#7b5a8e" />
            <View style={{ flex: 1 }}>
              <Text style={styles.parentName}>{p.name}</Text>
              {!!p.email && <Text style={styles.parentContact}>{p.email}</Text>}
              {!!p.phone && <Text style={styles.parentContact}>{p.phone}</Text>}
            </View>
          </View>
          <View style={styles.parentActions}>
            {!!p.email && (
              <Pressable
                style={styles.parentActionPrimary}
                onPress={() => Linking.openURL(`mailto:${p.email}`)}
              >
                <LinearGradient
                  colors={[GlassTheme.primaryGlass, GlassTheme.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name="mail-outline" size={15} color="#fff" />
                <Text style={styles.parentActionLabelPrimary}>Message</Text>
              </Pressable>
            )}
            {!!p.phone && (
              <Pressable
                style={styles.parentActionSecondary}
                onPress={() => Linking.openURL(`tel:${p.phone}`)}
              >
                <Ionicons name="call-outline" size={15} color={GlassTheme.ink} />
                <Text style={styles.parentActionLabelSecondary}>Call</Text>
              </Pressable>
            )}
          </View>
        </GlassCard>
      ))}
    </>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function ActionBtn({
  label, icon, color, onPress,
}: { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; onPress: () => void }) {
  return (
    <Pressable style={styles.actionBtn} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function ProgressStat({ value, label, sub, color }: { value: any; label: string; sub?: string; color: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );
}

function StatTile({ icon, value, label, color }: { icon: keyof typeof Ionicons.glyphMap; value: any; label: string; color: string }) {
  return (
    <GlassCard radius={16} style={styles.statTile}>
      <View style={[styles.statTileIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statTileValue, { color }]}>{value}</Text>
      <Text style={styles.statTileLabel}>{label}</Text>
    </GlassCard>
  );
}

function AttendanceBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    PRESENT:  { label: 'Present',  color: GlassTheme.primary, bg: GlassTheme.primarySoft },
    ABSENT:   { label: 'Absent',   color: GlassTheme.error,   bg: 'rgba(180,80,46,0.12)' },
    LATE:     { label: 'Late',     color: GlassTheme.accent,  bg: GlassTheme.accentSoft },
    EXCUSED:  { label: 'Excused',  color: GlassTheme.inkMuted, bg: 'rgba(90,106,85,0.12)' },
  };
  const { label, color, bg } = map[status] ?? map.PRESENT!;
  return (
    <View style={[styles.attendBadge, { backgroundColor: bg }]}>
      <Text style={[styles.attendBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    IN_PROGRESS:   { label: 'In progress', color: GlassTheme.accent, bg: GlassTheme.accentSoft },
    COMPLETED:     { label: 'Done', color: GlassTheme.primary, bg: GlassTheme.primarySoft },
    ASSIGNED:      { label: 'Assigned', color: GlassTheme.inkMuted, bg: 'rgba(90,106,85,0.12)' },
    NEEDS_REVIEW:  { label: 'Needs review', color: GlassTheme.error, bg: 'rgba(180,80,46,0.12)' },
  };
  const { label, color, bg } = map[status] ?? map.ASSIGNED!;
  return (
    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
      <Text style={[styles.statusBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
  return (
    <View style={[styles.infoRow, divider && styles.infoRowDivider]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function assignLabel(type: string) {
  if (type === 'NEW_MEMORIZATION') return 'New Hifz';
  if (type === 'RECENT_REVISION') return 'Sabqi';
  if (type === 'DISTANT_REVISION') return 'Manzil';
  return type;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 15, color: GlassTheme.inkMuted },

  // Back
  backBtn: {
    width: 36, height: 36, borderRadius: 12, marginBottom: 20,
    backgroundColor: GlassTheme.card,
    borderWidth: 0.5, borderColor: GlassTheme.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },

  // Hero
  hero: { flexDirection: 'row', gap: 16, alignItems: 'flex-end', marginBottom: 20 },
  ringWrap: { width: 84, height: 84, position: 'relative', flexShrink: 0 },
  ringSvgWrap: { position: 'absolute', top: 0, left: 0 },
  avatarCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  heroInfo: { flex: 1, paddingBottom: 4 },
  heroName: {
    fontFamily: GlassFonts.display,
    fontSize: 26, fontWeight: '500',
    color: GlassTheme.ink, lineHeight: 30,
    letterSpacing: -0.5,
  },
  heroSub: { fontSize: 13, color: GlassTheme.inkMuted, marginTop: 3 },
  pills: { flexDirection: 'row', gap: 8, marginTop: 10 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999,
    backgroundColor: GlassTheme.card,
    borderWidth: 0.5, borderColor: GlassTheme.cardBorder,
  },
  pillText: { fontFamily: GlassFonts.body, fontWeight: '700', fontSize: 12, color: GlassTheme.ink },

  // Quick actions
  actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  actionBtn: {
    flex: 1, alignItems: 'center', gap: 6,
    paddingVertical: 14, paddingHorizontal: 8, borderRadius: 18,
    backgroundColor: GlassTheme.card,
    borderWidth: 0.5, borderColor: GlassTheme.cardBorder,
  },
  actionIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 11, fontWeight: '600', color: GlassTheme.ink },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    padding: 3,
    marginBottom: 22,
    borderRadius: 14,
    backgroundColor: GlassTheme.card,
    borderWidth: 0.5,
    borderColor: GlassTheme.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1, paddingVertical: 9, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  tabItemActive: {},
  tabLabel: { fontWeight: '600', fontSize: 13, color: GlassTheme.inkMuted },
  tabLabelActive: { color: '#fff' },

  // Common section spacing
  section: { marginBottom: 20 },

  // Assignment card
  assignRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: 16 },
  assignType: { fontSize: 11, fontWeight: '600', color: GlassTheme.inkSubtle, letterSpacing: 0.5, textTransform: 'uppercase' },
  assignSurah: { fontFamily: GlassFonts.display, fontSize: 22, fontWeight: '500', color: GlassTheme.ink, marginTop: 4, letterSpacing: -0.4 },
  assignVerse: { fontSize: 13, color: GlassTheme.inkMuted, marginTop: 3 },
  assignProgress: { paddingHorizontal: 16, paddingBottom: 16 },
  assignBarBg: { height: 5, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 3, overflow: 'hidden' },
  assignBarFill: { height: 5, backgroundColor: STUDENT_COLOR, borderRadius: 3 },
  assignProgressLabel: { fontSize: 11, color: GlassTheme.inkSubtle, marginTop: 5 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },

  // Progress ring in tab
  statsInner: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 18 },
  progressRingWrap: { width: 80, height: 80, position: 'relative', flexShrink: 0 },
  progressRingCenter: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  progressPct: { fontFamily: GlassFonts.display, fontSize: 20, fontWeight: '600', color: STUDENT_COLOR, lineHeight: 24 },
  progressPctSign: { fontSize: 10, color: STUDENT_COLOR },
  statsCol: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontFamily: GlassFonts.display, fontSize: 17, fontWeight: '600' },
  statLabel: { fontSize: 10, color: GlassTheme.inkMuted, textAlign: 'center' },
  statSub: { fontSize: 9, color: GlassTheme.inkSubtle },
  statDivider: { width: 0.5, height: 30, backgroundColor: GlassTheme.line },

  // Heatmap
  heatmapGrid: { padding: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  heatmapDay: { width: HEATMAP_CELL, textAlign: 'center', fontSize: 9, color: GlassTheme.inkSubtle, fontWeight: '600', marginBottom: 2 },
  heatmapCell: { width: HEATMAP_CELL, height: HEATMAP_CELL, borderRadius: 5 },
  heatmapFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 14 },
  heatmapSub: { fontSize: 11, color: GlassTheme.inkMuted },
  heatmapStreak: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heatmapStreakText: { fontSize: 11, fontWeight: '600', color: GlassTheme.accent },

  // Goals
  goalRow: { paddingHorizontal: 16, paddingVertical: 14 },
  goalDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: GlassTheme.line },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  goalBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: GlassTheme.accentSoft },
  goalBadgeText: { fontSize: 10, fontWeight: '700', color: GlassTheme.accent, letterSpacing: 0.3 },
  goalTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: GlassTheme.ink },
  goalPct: { fontSize: 13, fontWeight: '600', color: STUDENT_COLOR },
  goalBarBg: { height: 6, borderRadius: 3, backgroundColor: GlassTheme.primarySoft, overflow: 'hidden' },
  goalBarFill: { height: 6, borderRadius: 3, backgroundColor: STUDENT_COLOR },
  goalDue: { fontSize: 11, color: GlassTheme.inkSubtle, marginTop: 6 },

  // Stats 2×2 grid
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statTile: { width: '47%', padding: 14, alignItems: 'center', gap: 6 },
  statTileIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statTileValue: { fontFamily: GlassFonts.display, fontSize: 22, fontWeight: '600' },
  statTileLabel: { fontSize: 11, color: GlassTheme.inkMuted, textAlign: 'center' },

  // Sessions tab
  mistakeRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 18, paddingHorizontal: 12 },
  mistakeItem: { alignItems: 'center', gap: 4 },
  mistakeDot: { width: 10, height: 10, borderRadius: 5 },
  mistakeCount: { fontFamily: GlassFonts.display, fontSize: 24, fontWeight: '600' },
  mistakeLabel: { fontSize: 11, color: GlassTheme.inkMuted },
  mistakeDate: { textAlign: 'center', fontSize: 11, color: GlassTheme.inkSubtle, paddingBottom: 14 },
  emptySession: { alignItems: 'center', gap: 8, paddingVertical: 32 },
  emptySessionText: { fontSize: 14, color: GlassTheme.inkMuted },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  sessionDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: GlassTheme.line },
  attendDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  sessionBody: { flex: 1 },
  sessionSurah: { fontSize: 14, fontWeight: '600', color: GlassTheme.ink },
  sessionDate: { fontSize: 11, color: GlassTheme.inkSubtle, marginTop: 2 },
  sessionRight: { gap: 4, alignItems: 'flex-end' },
  qualityPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
    backgroundColor: GlassTheme.accentSoft,
  },
  qualityText: { fontSize: 10, fontWeight: '600', color: GlassTheme.accent },
  attendBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  attendBadgeText: { fontSize: 10, fontWeight: '600' },

  // Parent tab
  parentHeader: { flexDirection: 'row', gap: 14, alignItems: 'center', padding: 18, paddingBottom: 14 },
  parentName: { fontFamily: GlassFonts.display, fontSize: 20, fontWeight: '500', color: GlassTheme.ink, letterSpacing: -0.3 },
  parentContact: { fontSize: 13, color: GlassTheme.primary, marginTop: 2 },
  parentActions: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingBottom: 18 },
  parentActionPrimary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 13, borderRadius: 14, overflow: 'hidden',
  },
  parentActionLabelPrimary: { color: '#fff', fontWeight: '600', fontSize: 14 },
  parentActionSecondary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 13, borderRadius: 14,
    backgroundColor: GlassTheme.card,
    borderWidth: 0.5, borderColor: GlassTheme.cardBorder,
  },
  parentActionLabelSecondary: { color: GlassTheme.ink, fontWeight: '600', fontSize: 14 },
  emptyParent: { alignItems: 'center', gap: 10, paddingVertical: 32, paddingHorizontal: 20 },
  emptyParentText: { fontSize: 14, color: GlassTheme.inkMuted, textAlign: 'center' },

  // Info rows (details section)
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  infoRowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: GlassTheme.line },
  infoLabel: { fontSize: 13, color: GlassTheme.inkMuted },
  infoValue: { fontSize: 13, fontWeight: '500', color: GlassTheme.ink, flex: 1, textAlign: 'right', paddingLeft: 16 },

  notesText: { fontSize: 14, lineHeight: 22, color: GlassTheme.ink },
});
