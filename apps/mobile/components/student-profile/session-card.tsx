import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';

interface SessionCardProps {
  date: Date | string;
  type: 'NEW_HIFZ' | 'RECENT_REVIEW' | 'OLD_REVIEW' | 'MIXED';
  attendance: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE';
  duration?: number | null;
  startSurah?: number | null;
  startAyah?: number | null;
  endSurah?: number | null;
  endAyah?: number | null;
  ayahsCovered?: number | null;
  qualityRating?: number | null;
  teacherName: string;
  notes?: string | null;
}

const SURAH_NAMES: Record<number, string> = {
  1: 'Al-Fatiha',
  2: 'Al-Baqarah',
  3: 'Aal-Imran',
  4: 'An-Nisa',
  5: 'Al-Ma\'idah',
  6: 'Al-An\'am',
  7: 'Al-A\'raf',
  // Add more as needed, or use a full list
  112: 'Al-Ikhlas',
  113: 'Al-Falaq',
  114: 'An-Nas',
};

export function SessionCard({
  date,
  type,
  attendance,
  duration,
  startSurah,
  startAyah,
  endSurah,
  endAyah,
  ayahsCovered,
  qualityRating,
  teacherName,
  notes,
}: SessionCardProps) {
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const mutedColor = useThemeColor({}, 'mutedForeground');

  const getTypeConfig = () => {
    switch (type) {
      case 'NEW_HIFZ':
        return { icon: 'book' as const, color: '#10B981', label: 'New Hifz' };
      case 'RECENT_REVIEW':
        return { icon: 'refresh' as const, color: '#3B82F6', label: 'Sabqi' };
      case 'OLD_REVIEW':
        return { icon: 'library' as const, color: '#8B5CF6', label: 'Manzil' };
      default:
        return { icon: 'layers' as const, color: '#F59E0B', label: 'Mixed' };
    }
  };

  const getAttendanceConfig = () => {
    switch (attendance) {
      case 'PRESENT':
        return { color: '#10B981', label: 'Present' };
      case 'ABSENT':
        return { color: '#EF4444', label: 'Absent' };
      case 'EXCUSED':
        return { color: '#F59E0B', label: 'Excused' };
      case 'LATE':
        return { color: '#F97316', label: 'Late' };
    }
  };

  const config = getTypeConfig();
  const attendanceConfig = getAttendanceConfig();
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const getSurahName = (num: number) => SURAH_NAMES[num] || `Surah ${num}`;

  const getQuranRange = () => {
    if (!startSurah || !startAyah) return null;
    const start = `${getSurahName(startSurah)}:${startAyah}`;
    if (!endSurah || !endAyah) return start;
    if (startSurah === endSurah) {
      return `${getSurahName(startSurah)}:${startAyah}-${endAyah}`;
    }
    return `${start} - ${getSurahName(endSurah)}:${endAyah}`;
  };

  const quranRange = getQuranRange();

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}>
          <Ionicons name={config.icon} size={16} color={config.color} />
        </View>
        <View style={styles.headerText}>
          <ThemedText style={[styles.typeLabel, { color: config.color }]}>{config.label}</ThemedText>
          <ThemedText style={[styles.date, { color: mutedColor }]}>{formattedDate}</ThemedText>
        </View>
        <View style={[styles.attendanceBadge, { backgroundColor: `${attendanceConfig.color}15` }]}>
          <View style={[styles.attendanceDot, { backgroundColor: attendanceConfig.color }]} />
          <ThemedText style={[styles.attendanceText, { color: attendanceConfig.color }]}>
            {attendanceConfig.label}
          </ThemedText>
        </View>
      </View>

      {quranRange && (
        <View style={styles.quranRange}>
          <Ionicons name="book-outline" size={14} color={mutedColor} />
          <ThemedText style={styles.quranRangeText}>{quranRange}</ThemedText>
          {ayahsCovered && (
            <ThemedText style={[styles.ayahCount, { color: mutedColor }]}>
              ({ayahsCovered} ayahs)
            </ThemedText>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="person-outline" size={14} color={mutedColor} />
          <ThemedText style={[styles.footerText, { color: mutedColor }]}>{teacherName}</ThemedText>
        </View>
        {duration && (
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={14} color={mutedColor} />
            <ThemedText style={[styles.footerText, { color: mutedColor }]}>{duration} min</ThemedText>
          </View>
        )}
        {qualityRating && (
          <View style={styles.footerItem}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <ThemedText style={[styles.footerText, { color: mutedColor }]}>{qualityRating}/5</ThemedText>
          </View>
        )}
      </View>

      {notes && (
        <ThemedText style={[styles.notes, { color: mutedColor }]} numberOfLines={2}>
          {notes}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    marginTop: 1,
  },
  attendanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  attendanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  attendanceText: {
    fontSize: 11,
    fontWeight: '500',
  },
  quranRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  quranRangeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  ayahCount: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
  notes: {
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});
