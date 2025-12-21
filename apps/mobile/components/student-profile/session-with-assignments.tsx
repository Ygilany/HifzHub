import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';

interface Assignment {
  id: string;
  type: 'NEW_MEMORIZATION' | 'RECENT_REVISION' | 'DISTANT_REVISION';
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'INCOMPLETE';
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  ayahCount?: number | null;
  grade?: number | null;
}

interface SessionWithAssignmentsProps {
  date: Date | string;
  attendance: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE';
  duration?: number | null;
  qualityRating?: number | null;
  teacherName: string;
  assignments: Assignment[];
}

const SURAH_NAMES: Record<number, string> = {
  1: 'Al-Fatiha', 2: 'Al-Baqarah', 3: 'Aal-Imran', 4: 'An-Nisa', 5: 'Al-Ma\'idah',
  6: 'Al-An\'am', 7: 'Al-A\'raf', 8: 'Al-Anfal', 9: 'At-Tawbah', 10: 'Yunus',
  78: 'An-Naba', 87: 'Al-A\'la', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas',
};

const getSurahName = (num: number) => SURAH_NAMES[num] || `${num}`;

const getAssignmentTypeConfig = (type: Assignment['type']) => {
  switch (type) {
    case 'NEW_MEMORIZATION':
      return { color: '#10B981', label: 'New', icon: 'add-circle' as const };
    case 'RECENT_REVISION':
      return { color: '#3B82F6', label: 'Sabqi', icon: 'refresh' as const };
    case 'DISTANT_REVISION':
      return { color: '#8B5CF6', label: 'Manzil', icon: 'library' as const };
  }
};

const getQuranRange = (a: Assignment) => {
  if (a.startSurah === a.endSurah) {
    return `${getSurahName(a.startSurah)}:${a.startAyah}-${a.endAyah}`;
  }
  return `${getSurahName(a.startSurah)}:${a.startAyah} - ${getSurahName(a.endSurah)}:${a.endAyah}`;
};

export function SessionWithAssignments({
  date,
  attendance,
  duration,
  qualityRating,
  teacherName,
  assignments,
}: SessionWithAssignmentsProps) {
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const mutedColor = useThemeColor({}, 'mutedForeground');
  const textColor = useThemeColor({}, 'text');

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const getAttendanceColor = () => {
    switch (attendance) {
      case 'PRESENT': return '#10B981';
      case 'ABSENT': return '#EF4444';
      case 'EXCUSED': return '#F59E0B';
      case 'LATE': return '#F97316';
    }
  };

  // Group assignments by type for summary
  const newCount = assignments.filter(a => a.type === 'NEW_MEMORIZATION').length;
  const sabqiCount = assignments.filter(a => a.type === 'RECENT_REVISION').length;
  const manzilCount = assignments.filter(a => a.type === 'DISTANT_REVISION').length;

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dateSection}>
          <ThemedText style={styles.date}>{formattedDate}</ThemedText>
          <View style={styles.metaRow}>
            <ThemedText style={[styles.metaText, { color: mutedColor }]}>{teacherName}</ThemedText>
            {duration && (
              <>
                <View style={[styles.dot, { backgroundColor: mutedColor }]} />
                <ThemedText style={[styles.metaText, { color: mutedColor }]}>{duration}m</ThemedText>
              </>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          {qualityRating && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <ThemedText style={styles.ratingText}>{qualityRating}</ThemedText>
            </View>
          )}
          <View style={[styles.attendanceDot, { backgroundColor: getAttendanceColor() }]} />
        </View>
      </View>

      {/* Assignments */}
      {assignments.length > 0 ? (
        <View style={styles.assignmentsSection}>
          {assignments.map((assignment, index) => {
            const config = getAssignmentTypeConfig(assignment.type);
            return (
              <View key={assignment.id} style={styles.assignmentRow}>
                <View style={[styles.typeIndicator, { backgroundColor: config.color }]} />
                <View style={styles.assignmentContent}>
                  <View style={styles.assignmentHeader}>
                    <ThemedText style={[styles.typeLabel, { color: config.color }]}>
                      {config.label}
                    </ThemedText>
                    {assignment.grade && (
                      <ThemedText style={[styles.gradeText, { color: mutedColor }]}>
                        {assignment.grade}/5
                      </ThemedText>
                    )}
                  </View>
                  <ThemedText style={[styles.rangeText, { color: textColor }]} numberOfLines={1}>
                    {getQuranRange(assignment)}
                    {assignment.ayahCount && (
                      <ThemedText style={[styles.ayahCount, { color: mutedColor }]}>
                        {' '}({assignment.ayahCount} ayahs)
                      </ThemedText>
                    )}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.noAssignments}>
          <ThemedText style={[styles.noAssignmentsText, { color: mutedColor }]}>
            No assignments recorded
          </ThemedText>
        </View>
      )}

      {/* Quick summary badges */}
      {assignments.length > 0 && (
        <View style={styles.summaryRow}>
          {newCount > 0 && (
            <View style={[styles.summaryBadge, { backgroundColor: '#10B98115' }]}>
              <ThemedText style={[styles.summaryText, { color: '#10B981' }]}>
                {newCount} New
              </ThemedText>
            </View>
          )}
          {sabqiCount > 0 && (
            <View style={[styles.summaryBadge, { backgroundColor: '#3B82F615' }]}>
              <ThemedText style={[styles.summaryText, { color: '#3B82F6' }]}>
                {sabqiCount} Sabqi
              </ThemedText>
            </View>
          )}
          {manzilCount > 0 && (
            <View style={[styles.summaryBadge, { backgroundColor: '#8B5CF615' }]}>
              <ThemedText style={[styles.summaryText, { color: '#8B5CF6' }]}>
                {manzilCount} Manzil
              </ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateSection: {
    flex: 1,
  },
  date: {
    fontSize: 15,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F59E0B15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  attendanceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  assignmentsSection: {
    gap: 8,
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  typeIndicator: {
    width: 3,
    height: '100%',
    minHeight: 32,
    borderRadius: 1.5,
    marginRight: 10,
  },
  assignmentContent: {
    flex: 1,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  gradeText: {
    fontSize: 11,
  },
  rangeText: {
    fontSize: 13,
  },
  ayahCount: {
    fontSize: 12,
  },
  noAssignments: {
    paddingVertical: 8,
  },
  noAssignmentsText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  summaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  summaryText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
