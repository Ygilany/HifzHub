import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground, GlassCard, SectionLabel } from '@/components/glass';
import { RangePicker } from '@/components/quran';
import { GlassFonts, GlassTheme } from '@/constants/glass-theme';
import { SurahRange } from '@/lib/quran/quran-range-service';
import { SURAH_NAMES } from '@/lib/quran/types';
import { api } from '@/lib/trpc/client';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE';
type AssignmentType = 'NEW_MEMORIZATION' | 'RECENT_REVISION' | 'DISTANT_REVISION';

interface AssignmentInput {
  id: string;
  type: AssignmentType;
  startSurah: string;
  startAyah: string;
  endSurah: string;
  endAyah: string;
  grade?: string;
}

const ATTENDANCE_OPTIONS: { value: AttendanceStatus; label: string; color: string; bg: string }[] = [
  { value: 'PRESENT', label: 'Present', color: GlassTheme.primary,   bg: GlassTheme.primarySoft },
  { value: 'LATE',    label: 'Late',    color: GlassTheme.accent,    bg: GlassTheme.accentSoft },
  { value: 'EXCUSED', label: 'Excused', color: '#8a6d3a',            bg: 'rgba(138,109,58,0.14)' },
  { value: 'ABSENT',  label: 'Absent',  color: GlassTheme.error,     bg: 'rgba(180,80,46,0.12)' },
];

const ASSIGNMENT_TYPES: { value: AssignmentType; label: string; sub: string; color: string; bg: string }[] = [
  { value: 'NEW_MEMORIZATION', label: 'New Hifz',  sub: 'New memorization', color: GlassTheme.primary, bg: GlassTheme.primarySoft },
  { value: 'RECENT_REVISION',  label: 'Sabqi',     sub: 'Recent review',    color: GlassTheme.accent,  bg: GlassTheme.accentSoft },
  { value: 'DISTANT_REVISION', label: 'Manzil',    sub: 'Distant review',   color: '#7b5a8e',          bg: 'rgba(123,90,142,0.14)' },
];

function rangeDisplay(a: AssignmentInput): string | null {
  const ss = parseInt(a.startSurah, 10);
  const sa = parseInt(a.startAyah, 10);
  const es = parseInt(a.endSurah, 10);
  const ea = parseInt(a.endAyah, 10);
  if (isNaN(ss) || isNaN(sa) || isNaN(es) || isNaN(ea)) return null;
  const sn = SURAH_NAMES[ss] ?? `Surah ${ss}`;
  const en = SURAH_NAMES[es] ?? `Surah ${es}`;
  if (ss === es) return `${sn}  ${sa} – ${ea}`;
  return `${sn} ${sa}  →  ${en} ${ea}`;
}

export default function NewSessionScreen() {
  const { id: studentId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: studentProfile } = api.students.getProfile.useQuery(
    { studentId },
    { enabled: !!studentId },
  );

  // ── Form state ────────────────────────────────────────────────────────────
  const [attendance, setAttendance] = useState<AttendanceStatus>('PRESENT');
  const [duration, setDuration] = useState('');
  const [qualityRating, setQualityRating] = useState<number | null>(null);
  const [teacherNotes, setTeacherNotes] = useState('');
  const [assignments, setAssignments] = useState<AssignmentInput[]>([]);
  const [rangePickerVisible, setRangePickerVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const createSession = api.sessions.create.useMutation({
    onSuccess: () => {
      Alert.alert('Session saved', 'The session has been recorded.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (err) => Alert.alert('Could not save', err.message),
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const addAssignment = () =>
    setAssignments((prev) => [
      ...prev,
      { id: Date.now().toString(), type: 'NEW_MEMORIZATION', startSurah: '', startAyah: '', endSurah: '', endAyah: '' },
    ]);

  const updateAssignment = (id: string, patch: Partial<AssignmentInput>) =>
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const removeAssignment = (id: string) =>
    setAssignments((prev) => prev.filter((a) => a.id !== id));

  const handleRangeSelect = (range: SurahRange) => {
    if (!editingId) return;
    updateAssignment(editingId, {
      startSurah: range.startSurah.toString(),
      startAyah: range.startAyah.toString(),
      endSurah: range.endSurah.toString(),
      endAyah: range.endAyah.toString(),
    });
    setRangePickerVisible(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    const valid = assignments
      .filter((a) => a.startSurah && a.startAyah && a.endSurah && a.endAyah)
      .map((a) => ({
        type: a.type,
        startSurah: parseInt(a.startSurah, 10),
        startAyah: parseInt(a.startAyah, 10),
        endSurah: parseInt(a.endSurah, 10),
        endAyah: parseInt(a.endAyah, 10),
        grade: a.grade ? parseInt(a.grade, 10) : undefined,
      }));

    createSession.mutate({
      studentId,
      sessionDate: new Date().toISOString(),
      attendanceStatus: attendance,
      durationMinutes: duration ? parseInt(duration, 10) : undefined,
      qualityRating: qualityRating ?? undefined,
      teacherNotes: teacherNotes || undefined,
      assignments: valid,
    });
  };

  const editingAssignment = assignments.find((a) => a.id === editingId);

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* ── Top bar ─────────────────────────────────────────────────── */}
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color={GlassTheme.ink} />
            </Pressable>
            <View style={styles.topCenter}>
              <Text style={styles.topTitle}>New Session</Text>
              {studentProfile?.name && (
                <Text style={styles.topSub}>for {studentProfile.name}</Text>
              )}
            </View>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Attendance ────────────────────────────────────────────── */}
            <View style={styles.section}>
              <SectionLabel>ATTENDANCE</SectionLabel>
              <View style={styles.pillRow}>
                {ATTENDANCE_OPTIONS.map((opt) => {
                  const selected = attendance === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => setAttendance(opt.value)}
                      style={[
                        styles.pill,
                        { borderColor: selected ? opt.color : GlassTheme.line },
                        selected && { backgroundColor: opt.bg },
                      ]}
                    >
                      <View style={[styles.pillDot, { backgroundColor: opt.color }]} />
                      <Text style={[styles.pillLabel, selected && { color: opt.color, fontWeight: '600' }]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* ── Session details ───────────────────────────────────────── */}
            <View style={styles.section}>
              <SectionLabel>SESSION DETAILS</SectionLabel>
              <GlassCard radius={20}>
                <View style={styles.detailsInner}>
                  {/* Duration */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Duration (min)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={duration}
                      onChangeText={setDuration}
                      placeholder="e.g. 30"
                      placeholderTextColor={GlassTheme.inkSubtle}
                      keyboardType="number-pad"
                      returnKeyType="done"
                    />
                  </View>

                  <View style={styles.detailsDivider} />

                  {/* Quality */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Session quality</Text>
                    <View style={styles.starRow}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Pressable
                          key={n}
                          hitSlop={4}
                          onPress={() => setQualityRating(qualityRating === n ? null : n)}
                        >
                          <Ionicons
                            name={qualityRating !== null && qualityRating >= n ? 'star' : 'star-outline'}
                            size={28}
                            color={GlassTheme.accent}
                          />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
              </GlassCard>
            </View>

            {/* ── Assignments ───────────────────────────────────────────── */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <SectionLabel>ASSIGNMENTS</SectionLabel>
                <Pressable onPress={addAssignment} style={styles.addBtn} hitSlop={6}>
                  <Ionicons name="add" size={16} color={GlassTheme.primary} />
                  <Text style={styles.addBtnLabel}>Add</Text>
                </Pressable>
              </View>

              {assignments.length === 0 ? (
                <GlassCard radius={20} style={styles.emptyCard}>
                  <Ionicons name="document-text-outline" size={32} color={GlassTheme.inkSubtle} />
                  <Text style={styles.emptyTitle}>No assignments yet</Text>
                  <Text style={styles.emptySub}>{'Tap "Add" to record what was covered'}</Text>
                </GlassCard>
              ) : (
                <View style={styles.assignmentList}>
                  {assignments.map((a, i) => {
                    const typeOpt = ASSIGNMENT_TYPES.find((t) => t.value === a.type)!;
                    const range = rangeDisplay(a);
                    return (
                      <GlassCard key={a.id} radius={20} style={styles.assignmentCard}>
                        {/* Card header */}
                        <View style={styles.assignmentTopBar}>
                          <Text style={styles.assignmentNum}>Assignment {i + 1}</Text>
                          <Pressable
                            onPress={() => removeAssignment(a.id)}
                            hitSlop={8}
                            style={styles.removeBtn}
                          >
                            <Ionicons name="close" size={16} color={GlassTheme.error} />
                          </Pressable>
                        </View>

                        {/* Type selector */}
                        <View style={styles.typeRow}>
                          {ASSIGNMENT_TYPES.map((t) => {
                            const active = a.type === t.value;
                            return (
                              <Pressable
                                key={t.value}
                                onPress={() => updateAssignment(a.id, { type: t.value })}
                                style={[
                                  styles.typeChip,
                                  { borderColor: active ? t.color : GlassTheme.line },
                                  active && { backgroundColor: t.bg },
                                ]}
                              >
                                <Text style={[styles.typeChipLabel, active && { color: t.color, fontWeight: '700' }]}>
                                  {t.label}
                                </Text>
                                <Text style={[styles.typeChipSub, active && { color: t.color, opacity: 0.7 }]}>
                                  {t.sub}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>

                        {/* Range button */}
                        <Pressable
                          onPress={() => { setEditingId(a.id); setRangePickerVisible(true); }}
                          style={styles.rangeBtn}
                        >
                          <View style={styles.rangeBtnInner}>
                            <View style={[styles.rangeBtnIcon, { backgroundColor: typeOpt.bg }]}>
                              <Ionicons name="book-outline" size={16} color={typeOpt.color} />
                            </View>
                            <Text
                              style={[styles.rangeBtnText, !range && { color: GlassTheme.inkSubtle }]}
                              numberOfLines={1}
                            >
                              {range ?? 'Tap to select range'}
                            </Text>
                            <Ionicons name="chevron-forward" size={16} color={GlassTheme.inkSubtle} />
                          </View>
                        </Pressable>

                        {/* Grade */}
                        <View style={styles.gradeRow}>
                          <Text style={styles.gradeLabel}>Grade</Text>
                          <View style={styles.gradeStars}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Pressable
                                key={n}
                                hitSlop={4}
                                onPress={() =>
                                  updateAssignment(a.id, {
                                    grade: a.grade === n.toString() ? '' : n.toString(),
                                  })
                                }
                              >
                                <Ionicons
                                  name={a.grade && parseInt(a.grade, 10) >= n ? 'star' : 'star-outline'}
                                  size={22}
                                  color={GlassTheme.accent}
                                />
                              </Pressable>
                            ))}
                          </View>
                        </View>
                      </GlassCard>
                    );
                  })}
                </View>
              )}
            </View>

            {/* ── Notes ─────────────────────────────────────────────────── */}
            <View style={styles.section}>
              <SectionLabel>NOTES</SectionLabel>
              <GlassCard radius={20}>
                <TextInput
                  style={styles.notesInput}
                  value={teacherNotes}
                  onChangeText={setTeacherNotes}
                  placeholder="Add notes about this session…"
                  placeholderTextColor={GlassTheme.inkSubtle}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </GlassCard>
            </View>

            {/* ── Submit ────────────────────────────────────────────────── */}
            <Pressable
              onPress={handleSubmit}
              disabled={createSession.isPending}
              style={[styles.submitWrap, createSession.isPending && { opacity: 0.6 }]}
            >
              <LinearGradient
                colors={[GlassTheme.primaryGlass, GlassTheme.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitBtn}
              >
                {createSession.isPending ? (
                  <Text style={styles.submitLabel}>Saving…</Text>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.submitLabel}>Save Session</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <View style={{ height: 60 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Range picker modal */}
      {editingId && (
        <RangePicker
          visible={rangePickerVisible}
          onClose={() => { setRangePickerVisible(false); setEditingId(null); }}
          onSelect={handleRangeSelect}
          initialRange={
            editingAssignment?.startSurah
              ? {
                  startSurah: parseInt(editingAssignment.startSurah, 10),
                  startAyah: parseInt(editingAssignment.startAyah, 10),
                  endSurah: parseInt(editingAssignment.endSurah, 10),
                  endAyah: parseInt(editingAssignment.endAyah, 10),
                }
              : undefined
          }
        />
      )}
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: GlassTheme.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: GlassTheme.cardBorder,
  },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle: {
    fontFamily: GlassFonts.display,
    fontSize: 20,
    fontWeight: '500',
    color: GlassTheme.ink,
    letterSpacing: -0.3,
  },
  topSub: { fontSize: 12, color: GlassTheme.inkMuted, marginTop: 1 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  section: { marginBottom: 20 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: GlassTheme.primarySoft,
    borderWidth: 0.5,
    borderColor: GlassTheme.cardBorder,
  },
  addBtnLabel: { fontSize: 13, fontWeight: '600', color: GlassTheme.primary },

  // Attendance pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: GlassTheme.line,
    backgroundColor: GlassTheme.card,
  },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
  pillLabel: { fontSize: 13, color: GlassTheme.inkMuted },

  // Session details card
  detailsInner: { padding: 16 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: GlassTheme.inkMuted, letterSpacing: 0.3 },
  textInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GlassTheme.line,
    paddingHorizontal: 14,
    fontSize: 15,
    color: GlassTheme.ink,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  detailsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: GlassTheme.line,
    marginVertical: 14,
  },
  starRow: { flexDirection: 'row', gap: 4 },

  // Assignments
  emptyCard: { alignItems: 'center', gap: 8, paddingVertical: 28, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: GlassTheme.inkMuted },
  emptySub: { fontSize: 12, color: GlassTheme.inkSubtle, textAlign: 'center' },
  assignmentList: { gap: 12 },
  assignmentCard: {},
  assignmentTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  assignmentNum: {
    fontSize: 11,
    fontWeight: '700',
    color: GlassTheme.inkSubtle,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(180,80,46,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Type chips
  typeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GlassTheme.line,
    alignItems: 'center',
    gap: 2,
    backgroundColor: GlassTheme.card,
  },
  typeChipLabel: { fontSize: 13, fontWeight: '600', color: GlassTheme.inkMuted },
  typeChipSub: { fontSize: 9, color: GlassTheme.inkSubtle, textAlign: 'center' },

  // Range button
  rangeBtn: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GlassTheme.line,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  rangeBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  rangeBtnIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: GlassTheme.ink,
  },

  // Grade
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  gradeLabel: { fontSize: 12, fontWeight: '600', color: GlassTheme.inkMuted, width: 42 },
  gradeStars: { flexDirection: 'row', gap: 3 },

  // Notes
  notesInput: {
    minHeight: 100,
    padding: 14,
    fontSize: 14,
    color: GlassTheme.ink,
    lineHeight: 22,
  },

  // Submit
  submitWrap: { borderRadius: 18, overflow: 'hidden', marginTop: 4 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  submitLabel: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
});
