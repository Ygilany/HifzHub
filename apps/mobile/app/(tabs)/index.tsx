import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  AnimatedHeader,
  HEADER_MAX_HEIGHT_EXPORT,
  ScheduleCard,
  StudentCard,
} from '@/components/home';
import { SectionHeader } from '@/components/ui';
import { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock data for demonstration
const SCHEDULE_ITEMS = [
  { id: '1', subject: 'Geography', time: '09:00 AM', icon: 'globe-outline', color: '#F59E0B' },
  { id: '2', subject: 'Arabic', time: '10:30 AM', icon: 'book-outline', color: '#FDB022' },
  { id: '3', subject: 'Science', time: '02:00 PM', icon: 'flask-outline', color: '#06B6D4' },
  { id: '4', subject: 'History', time: '03:15 PM', icon: 'time-outline', color: '#F97316' },
];

const STUDENTS = [
  { id: '1', name: 'Ahmed', avatar: '👦' },
  { id: '2', name: 'Amina', avatar: '👧' },
  { id: '3', name: 'Omar', avatar: '👶' },
];

export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right']}>
      {/* Fixed Animated Header with Parallax */}
      <AnimatedHeader scrollY={scrollY} />

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingTop: HEADER_MAX_HEIGHT_EXPORT - insets.top,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Schedule Section */}
        <ThemedView style={styles.section}>
          <SectionHeader icon="calendar" title="Today's Schedule" />
          <View style={styles.scheduleList}>
            {SCHEDULE_ITEMS.map((item) => (
              <ScheduleCard
                key={item.id}
                subject={item.subject}
                time={item.time}
                icon={item.icon as any}
                color={item.color}
              />
            ))}
          </View>
        </ThemedView>

        {/* Students Section */}
        <ThemedView style={styles.section}>
          <SectionHeader icon="people" title="Students" />
          <View style={styles.studentsList}>
            {STUDENTS.map((student) => (
              <StudentCard
                key={student.id}
                name={student.name}
                avatar={student.avatar}
              />
            ))}
          </View>
        </ThemedView>

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  scheduleList: {
    gap: 12,
  },
  studentsList: {
    gap: 12,
  },
});
