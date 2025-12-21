import { RangePicker } from '@/components/quran';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SurahRange } from '@/lib/quran/quran-range-service';
import { SURAH_NAMES } from '@/lib/quran/types';
import { api } from '@/lib/trpc/client';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const ATTENDANCE_OPTIONS: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: 'PRESENT', label: 'Present', color: '#10B981' },
  { value: 'LATE', label: 'Late', color: '#F97316' },
  { value: 'EXCUSED', label: 'Excused', color: '#F59E0B' },
  { value: 'ABSENT', label: 'Absent', color: '#EF4444' },
];

const ASSIGNMENT_TYPES: { value: AssignmentType; label: string; color: string }[] = [
  { value: 'NEW_MEMORIZATION', label: 'New Hifz', color: '#10B981' },
  { value: 'RECENT_REVISION', label: 'Sabqi', color: '#3B82F6' },
  { value: 'DISTANT_REVISION', label: 'Manzil', color: '#8B5CF6' },
];

export default function NewSessionScreen() {
  const { id: studentId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'mutedForeground');
  const tintColor = useThemeColor({}, 'tint');

  // Fetch student name
  const { data: studentProfile } = api.students.getProfile.useQuery(
    { studentId },
    { enabled: !!studentId }
  );

  // Helper function to get range display data
  const getRangeDisplayData = (assignment: AssignmentInput) => {
    if (
      !assignment.startSurah ||
      !assignment.startAyah ||
      !assignment.endSurah ||
      !assignment.endAyah ||
      assignment.startSurah.trim() === '' ||
      assignment.startAyah.trim() === '' ||
      assignment.endSurah.trim() === '' ||
      assignment.endAyah.trim() === ''
    ) {
      return null;
    }

    const startSurahNum = parseInt(assignment.startSurah, 10);
    const startAyahNum = parseInt(assignment.startAyah, 10);
    const endSurahNum = parseInt(assignment.endSurah, 10);
    const endAyahNum = parseInt(assignment.endAyah, 10);

    if (isNaN(startSurahNum) || isNaN(startAyahNum) || isNaN(endSurahNum) || isNaN(endAyahNum)) {
      return null;
    }

    const startSurahName = SURAH_NAMES[startSurahNum] || `Surah ${startSurahNum}`;
    const endSurahName = SURAH_NAMES[endSurahNum] || `Surah ${endSurahNum}`;

    return {
      startSurahName,
      startAyahNum,
      endSurahName,
      endAyahNum,
      isSameSurah: startSurahNum === endSurahNum,
    };
  };

  // Form state
  const [attendance, setAttendance] = useState<AttendanceStatus>('PRESENT');
  const [duration, setDuration] = useState('');
  const [qualityRating, setQualityRating] = useState<number | null>(null);
  const [teacherNotes, setTeacherNotes] = useState('');
  const [assignments, setAssignments] = useState<AssignmentInput[]>([]);
  const [rangePickerVisible, setRangePickerVisible] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);

  const createSession = api.sessions.create.useMutation({
    onSuccess: () => {
      Alert.alert('Success', 'Session created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const addAssignment = () => {
    setAssignments([
      ...assignments,
      {
        id: Date.now().toString(),
        type: 'NEW_MEMORIZATION',
        startSurah: '',
        startAyah: '',
        endSurah: '',
        endAyah: '',
      },
    ]);
  };

  const updateAssignment = (id: string, field: keyof AssignmentInput, value: string) => {
    setAssignments(
      assignments.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const removeAssignment = (id: string) => {
    setAssignments(assignments.filter((a) => a.id !== id));
  };

  const openRangePicker = (assignmentId: string) => {
    setEditingAssignmentId(assignmentId);
    setRangePickerVisible(true);
  };

  const handleRangeSelect = (range: SurahRange) => {
    if (!editingAssignmentId) {
      console.warn('No editing assignment ID when range selected');
      return;
    }

    console.log('Range selected:', range);
    console.log('Updating assignment:', editingAssignmentId);

    // Update all fields in a single state update
    setAssignments(
      assignments.map((a) => {
        if (a.id === editingAssignmentId) {
          const updated = {
            ...a,
            startSurah: range.startSurah.toString(),
            startAyah: range.startAyah.toString(),
            endSurah: range.endSurah.toString(),
            endAyah: range.endAyah.toString(),
          };
          console.log('Updated assignment:', updated);
          return updated;
        }
        return a;
      })
    );

    setRangePickerVisible(false);
    setEditingAssignmentId(null);
  };

  const handleSubmit = () => {
    // Validate assignments
    const validAssignments = assignments
      .filter(
        (a) =>
          a.startSurah &&
          a.startAyah &&
          a.endSurah &&
          a.endAyah &&
          a.startSurah.trim() !== '' &&
          a.startAyah.trim() !== '' &&
          a.endSurah.trim() !== '' &&
          a.endAyah.trim() !== ''
      )
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
      assignments: validAssignments,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </Pressable>
          <View style={styles.headerCenter}>
            <ThemedText style={styles.headerTitle}>New Session</ThemedText>
            {studentProfile?.name && (
              <ThemedText style={[styles.headerSubtitle, { color: mutedColor }]}>
                for {studentProfile.name}
              </ThemedText>
            )}
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Attendance Section */}
          <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
            <ThemedText style={styles.sectionTitle}>Attendance</ThemedText>
            <View style={styles.optionsRow}>
              {ATTENDANCE_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setAttendance(option.value)}
                  style={[
                    styles.optionButton,
                    {
                      borderColor: attendance === option.value ? option.color : borderColor,
                      backgroundColor:
                        attendance === option.value ? `${option.color}15` : 'transparent',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.optionDot,
                      { backgroundColor: option.color },
                    ]}
                  />
                  <ThemedText
                    style={[
                      styles.optionLabel,
                      attendance === option.value && { color: option.color, fontWeight: '600' },
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Duration & Quality */}
          <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
            <ThemedText style={styles.sectionTitle}>Session Details</ThemedText>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <ThemedText style={[styles.fieldLabel, { color: mutedColor }]}>
                  Duration (min)
                </ThemedText>
                <TextInput
                  style={[styles.input, { borderColor, color: textColor }]}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="30"
                  placeholderTextColor={mutedColor}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.halfField}>
                <ThemedText style={[styles.fieldLabel, { color: mutedColor }]}>
                  Quality (1-5)
                </ThemedText>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Pressable
                      key={rating}
                      onPress={() => setQualityRating(qualityRating === rating ? null : rating)}
                      style={styles.starButton}
                    >
                      <Ionicons
                        name={qualityRating && qualityRating >= rating ? 'star' : 'star-outline'}
                        size={28}
                        color="#F59E0B"
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Assignments Section */}
          <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>Assignments</ThemedText>
              <Pressable onPress={addAssignment} style={[styles.addButton, { backgroundColor: tintColor }]}>
                <Ionicons name="add" size={20} color="#fff" />
                <ThemedText style={styles.addButtonText}>Add</ThemedText>
              </Pressable>
            </View>

            {assignments.length === 0 ? (
              <View style={styles.emptyAssignments}>
                <Ionicons name="document-text-outline" size={32} color={mutedColor} />
                <ThemedText style={[styles.emptyText, { color: mutedColor }]}>
                  No assignments added yet
                </ThemedText>
                <ThemedText style={[styles.emptySubtext, { color: mutedColor }]}>
                  Tap &quot;Add&quot; to record what was covered
                </ThemedText>
              </View>
            ) : (
              assignments.map((assignment, index) => (
                <View key={assignment.id} style={[styles.assignmentCard, { borderColor }]}>
                  <View style={styles.assignmentHeader}>
                    <ThemedText style={styles.assignmentNumber}>#{index + 1}</ThemedText>
                    <Pressable
                      onPress={() => removeAssignment(assignment.id)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={22} color="#EF4444" />
                    </Pressable>
                  </View>

                  {/* Type Selection */}
                  <View style={styles.typeRow}>
                    {ASSIGNMENT_TYPES.map((type) => (
                      <Pressable
                        key={type.value}
                        onPress={() => updateAssignment(assignment.id, 'type', type.value)}
                        style={[
                          styles.typeButton,
                          {
                            borderColor: assignment.type === type.value ? type.color : borderColor,
                            backgroundColor:
                              assignment.type === type.value ? `${type.color}15` : 'transparent',
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.typeLabel,
                            assignment.type === type.value && { color: type.color, fontWeight: '600' },
                          ]}
                        >
                          {type.label}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>

                  {/* Quran Range */}
                  <ThemedText style={[styles.rangeLabel, { color: mutedColor }]}>
                    Quran Range
                  </ThemedText>
                  <Pressable
                    onPress={() => openRangePicker(assignment.id)}
                    style={[styles.rangeButton, { borderColor, backgroundColor: cardColor }]}
                  >
                    <View style={styles.rangeButtonContent}>
                      {(() => {
                        const rangeData = getRangeDisplayData(assignment);
                        if (!rangeData) {
                          return (
                            <ThemedText style={[styles.rangeButtonPlaceholder, { color: mutedColor }]}>
                              Tap to select range
                            </ThemedText>
                          );
                        }

                        return (
                          <View style={styles.rangeTextContainer}>
                            {rangeData.isSameSurah ? (
                              <>
                                <ThemedText style={[styles.rangeButtonText, styles.rangeArabicText]}>
                                  {rangeData.startSurahName}
                                </ThemedText>
                                <ThemedText style={[styles.rangeButtonText, styles.rangeSeparator]}> - </ThemedText>
                                <ThemedText style={[styles.rangeButtonText, styles.rangeNumberText]}>
                                  {rangeData.startAyahNum}
                                </ThemedText>
                                <ThemedText style={[styles.rangeButtonText, styles.rangeSeparator]}> to </ThemedText>
                                <ThemedText style={[styles.rangeButtonText, styles.rangeNumberText]}>
                                  {rangeData.endAyahNum}
                                </ThemedText>
                              </>
                            ) : (
                              <>
                                <ThemedText style={[styles.rangeButtonText, styles.rangeArabicText]}>
                                  {rangeData.startSurahName}
                                </ThemedText>
                                <ThemedText style={[styles.rangeButtonText, styles.rangeNumberText]}>
                                  {` ${rangeData.startAyahNum}`}
                                </ThemedText>
                                <ThemedText style={[styles.rangeButtonText, styles.rangeSeparator]}> to </ThemedText>
                                <ThemedText style={[styles.rangeButtonText, styles.rangeArabicText]}>
                                  {rangeData.endSurahName}
                                </ThemedText>
                                <ThemedText style={[styles.rangeButtonText, styles.rangeNumberText]}>
                                  {` ${rangeData.endAyahNum}`}
                                </ThemedText>
                              </>
                            )}
                          </View>
                        );
                      })()}
                      <Ionicons name="chevron-forward" size={20} color={mutedColor} style={styles.rangeButtonIcon} />
                    </View>
                  </Pressable>

                  {/* Grade */}
                  <View style={styles.gradeRow}>
                    <ThemedText style={[styles.gradeLabel, { color: mutedColor }]}>Grade:</ThemedText>
                    <View style={styles.gradeStars}>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Pressable
                          key={rating}
                          onPress={() =>
                            updateAssignment(
                              assignment.id,
                              'grade',
                              assignment.grade === rating.toString() ? '' : rating.toString()
                            )
                          }
                        >
                          <Ionicons
                            name={
                              assignment.grade && parseInt(assignment.grade, 10) >= rating
                                ? 'star'
                                : 'star-outline'
                            }
                            size={22}
                            color="#F59E0B"
                          />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Notes Section */}
          <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
            <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
            <TextInput
              style={[styles.notesInput, { borderColor, color: textColor }]}
              value={teacherNotes}
              onChangeText={setTeacherNotes}
              placeholder="Add notes about the session..."
              placeholderTextColor={mutedColor}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <Button
            title="Save Session"
            onPress={handleSubmit}
            loading={createSession.isPending}
            style={styles.submitButton}
          />

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Range Picker Modal */}
      {editingAssignmentId && (
        <RangePicker
          visible={rangePickerVisible}
          onClose={() => {
            setRangePickerVisible(false);
            setEditingAssignmentId(null);
          }}
          onSelect={handleRangeSelect}
          initialRange={(() => {
            const assignment = assignments.find((a) => a.id === editingAssignmentId);
            if (
              assignment &&
              assignment.startSurah &&
              assignment.startAyah &&
              assignment.endSurah &&
              assignment.endAyah &&
              assignment.startSurah.trim() !== '' &&
              assignment.startAyah.trim() !== '' &&
              assignment.endSurah.trim() !== '' &&
              assignment.endAyah.trim() !== ''
            ) {
              const startSurah = parseInt(assignment.startSurah, 10);
              const startAyah = parseInt(assignment.startAyah, 10);
              const endSurah = parseInt(assignment.endSurah, 10);
              const endAyah = parseInt(assignment.endAyah, 10);
              if (!isNaN(startSurah) && !isNaN(startAyah) && !isNaN(endSurah) && !isNaN(endAyah)) {
                return {
                  startSurah,
                  startAyah,
                  endSurah,
                  endAyah,
                };
              }
            }
            return undefined;
          })()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  optionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionLabel: {
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 2,
  },
  starButton: {
    padding: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyAssignments: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 12,
  },
  assignmentCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  assignmentNumber: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.5,
  },
  removeButton: {
    padding: 2,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 12,
  },
  rangeLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  rangeButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  rangeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flex: 1,
  },
  rangeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  rangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rangeArabicText: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  rangeNumberText: {
    writingDirection: 'ltr',
    textAlign: 'left',
  },
  rangeSeparator: {
    writingDirection: 'ltr',
    textAlign: 'left',
    marginHorizontal: 4,
  },
  rangeButtonPlaceholder: {
    fontSize: 14,
    flex: 1,
  },
  rangeButtonIcon: {
    marginLeft: 'auto',
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  gradeLabel: {
    fontSize: 12,
  },
  gradeStars: {
    flexDirection: 'row',
    gap: 2,
  },
  notesInput: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  submitButton: {
    marginTop: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
