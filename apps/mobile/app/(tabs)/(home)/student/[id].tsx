import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  GoalCard,
  InfoCard,
  InfoRow,
  ProgressRing,
  SessionCard,
  StatCard,
  StatRow,
} from '@/components/student-profile';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/lib/trpc/client';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StudentProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const backgroundColor = useThemeColor({}, 'background');
  const mutedColor = useThemeColor({}, 'mutedForeground');
  const tintColor = useThemeColor({}, 'tint');

  const {
    data: profile,
    isLoading,
    refetch,
    isRefetching,
  } = api.students.getProfile.useQuery(
    { studentId: id },
    { enabled: !!id }
  );

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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={48} color={mutedColor} />
          <ThemedText style={styles.emptyText}>Student not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const hasGoals = profile.goals.semester || profile.goals.annual || profile.goals.custom.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={tintColor}
          />
        }
      >
        {/* Header Section */}
        <ThemedView style={styles.headerSection}>
          <View style={styles.avatarContainer}>
            <ThemedText style={styles.avatarEmoji}>{getAvatarEmoji(profile.name)}</ThemedText>
          </View>
          <ThemedText style={styles.studentName}>{profile.name}</ThemedText>
          <ThemedText style={[styles.studentEmail, { color: mutedColor }]}>{profile.email}</ThemedText>

          {profile.programs.length > 0 && (
            <View style={styles.programBadges}>
              {profile.programs.map((program) => (
                <View key={program.id} style={[styles.programBadge, { backgroundColor: `${tintColor}15` }]}>
                  <ThemedText style={[styles.programBadgeText, { color: tintColor }]}>
                    {program.name}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </ThemedView>

        {/* Quran Progress Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book" size={20} color="#10B981" />
            <ThemedText style={styles.sectionTitle}>Quran Hifz Progress</ThemedText>
          </View>

          <View style={styles.progressContainer}>
            <ProgressRing
              progress={profile.quranProgress.completionPercentage}
              size={140}
              strokeWidth={12}
              label="Complete"
              sublabel={`${profile.quranProgress.totalAyahsMemorized} ayahs`}
            />
          </View>

          <StatRow>
            <StatCard
              icon="albums"
              iconColor="#8B5CF6"
              value={profile.quranProgress.totalJuzCompleted}
              label="Juz Completed"
              sublabel="of 30"
            />
            <StatCard
              icon="locate"
              iconColor="#3B82F6"
              value={`Juz ${profile.quranProgress.currentJuz}`}
              label="Current Position"
            />
          </StatRow>
        </View>

        {/* Goals Section */}
        {hasGoals && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flag" size={20} color="#F59E0B" />
              <ThemedText style={styles.sectionTitle}>Goals</ThemedText>
            </View>

            {profile.goals.semester && (
              <GoalCard
                type="SEMESTER"
                title={profile.goals.semester.title}
                description={profile.goals.semester.description}
                progress={
                  profile.goals.semester.targetAyahs
                    ? Math.round((profile.goals.semester.currentProgress / profile.goals.semester.targetAyahs) * 100)
                    : 0
                }
                status={profile.goals.semester.status}
                endDate={profile.goals.semester.endDate}
              />
            )}

            {profile.goals.annual && (
              <GoalCard
                type="ANNUAL"
                title={profile.goals.annual.title}
                description={profile.goals.annual.description}
                progress={
                  profile.goals.annual.targetAyahs
                    ? Math.round((profile.goals.annual.currentProgress / profile.goals.annual.targetAyahs) * 100)
                    : 0
                }
                status={profile.goals.annual.status}
                endDate={profile.goals.annual.endDate}
              />
            )}

            {profile.goals.custom.map((goal) => (
              <GoalCard
                key={goal.id}
                type="CUSTOM"
                title={goal.title}
                description={goal.description}
                progress={
                  goal.targetAyahs
                    ? Math.round((goal.currentProgress / goal.targetAyahs) * 100)
                    : 0
                }
                status={goal.status}
                endDate={goal.endDate}
              />
            ))}
          </View>
        )}

        {/* Session Statistics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart" size={20} color="#3B82F6" />
            <ThemedText style={styles.sectionTitle}>Session Statistics</ThemedText>
          </View>

          <StatRow>
            <StatCard
              icon="calendar"
              iconColor="#10B981"
              value={profile.stats.totalSessions}
              label="Total Sessions"
            />
            <StatCard
              icon="book"
              iconColor="#8B5CF6"
              value={profile.stats.totalHifzSessions}
              label="New Hifz"
            />
          </StatRow>

          <StatRow>
            <StatCard
              icon="refresh"
              iconColor="#3B82F6"
              value={profile.stats.totalReviewSessions}
              label="Review Sessions"
            />
            <StatCard
              icon="star"
              iconColor="#F59E0B"
              value={profile.stats.averageQuality || '—'}
              label="Avg Quality"
              sublabel="out of 5"
            />
          </StatRow>
        </View>

        {/* Parent/Guardian Information */}
        {profile.parents.length > 0 && (
          <View style={styles.section}>
            <InfoCard icon="people" iconColor="#8B5CF6" title="Parent/Guardian Information">
              {profile.parents.map((parent, index) => (
                <View key={parent.id}>
                  {index > 0 && <View style={styles.parentDivider} />}
                  <ThemedText style={styles.parentName}>{parent.name}</ThemedText>
                  <View style={styles.parentInfo}>
                    <InfoRow label="Email" value={parent.email} action="email" />
                    {parent.phone && (
                      <InfoRow label="Phone" value={parent.phone} action="call" />
                    )}
                    {parent.alternatePhone && (
                      <InfoRow label="Alt Phone" value={parent.alternatePhone} action="call" />
                    )}
                  </View>
                </View>
              ))}
            </InfoCard>
          </View>
        )}

        {/* Student Information */}
        <View style={styles.section}>
          <InfoCard icon="information-circle" iconColor="#6B7280" title="Student Information">
            <InfoRow
              label="Member Since"
              value={new Date(profile.memberSince).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            />
            <InfoRow
              label="Enrollment Date"
              value={new Date(profile.enrollmentDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            />
            {profile.phone && <InfoRow label="Phone" value={profile.phone} action="call" />}
            {profile.preferredSessionTime && (
              <InfoRow label="Preferred Time" value={profile.preferredSessionTime} />
            )}
          </InfoCard>
        </View>

        {/* Recent Sessions */}
        {profile.recentSessions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={20} color="#6366F1" />
              <ThemedText style={styles.sectionTitle}>Recent Sessions</ThemedText>
            </View>

            {profile.recentSessions.slice(0, 5).map((session) => (
              <SessionCard
                key={session.id}
                date={session.date}
                type={session.type}
                attendance={session.attendance}
                duration={session.duration}
                startSurah={session.startSurah}
                startAyah={session.startAyah}
                endSurah={session.endSurah}
                endAyah={session.endAyah}
                ayahsCovered={session.ayahsCovered}
                qualityRating={session.qualityRating}
                teacherName={session.teacherName}
                notes={session.notes}
              />
            ))}
          </View>
        )}

        {/* Notes */}
        {profile.notes && (
          <View style={styles.section}>
            <InfoCard icon="document-text" iconColor="#F59E0B" title="Notes">
              <ThemedText style={styles.notesText}>{profile.notes}</ThemedText>
            </InfoCard>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarEmoji: {
    fontSize: 44,
    lineHeight: 52,
    textAlign: 'center',
  },
  studentName: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 15,
  },
  programBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  programBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  programBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  parentDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 12,
  },
  parentName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  parentInfo: {
    gap: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});
