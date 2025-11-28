import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/lib/auth/context';
import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Header constants
const HEADER_MAX_HEIGHT = 400;
const HEADER_MIN_HEIGHT = 150;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

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
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({ light: '#FFF5E6', dark: '#2A2A2A' }, 'card');
  const textColor = useThemeColor({}, 'text');
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // Dark mode support
  const isDark = colorScheme === 'dark';
  const headerBackgroundColor = isDark ? '#1D3130' : '#FED7AE';
  const homePageImage = isDark
    ? require('@/assets/images/home-page-dark.png')
    : require('@/assets/images/home-page.png');

  // Header height animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  // Image dimensions
  const imageWidth = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [width * 0.85, 70], // Start smaller to avoid status bar overlap
    extrapolate: 'clamp',
  });

  const imageHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [260, 70],
    extrapolate: 'clamp',
  });

  // Parallax: Image moves left as we scroll
  const imageTranslateX = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -(width / 2 - 80)], // Move left, leaving space for text
    extrapolate: 'clamp',
  });

  // Image vertical position - move up when scrolled
  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [-20, 0], // Start slightly lower, move up
    extrapolate: 'clamp',
  });

  // Greeting text animations
  const greetingFontSize = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [20, 14],
    extrapolate: 'clamp',
  });

  // Text horizontal position - moves right as we scroll
  const greetingTranslateX = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 30], // Move right to appear next to image
    extrapolate: 'clamp',
  });

  // Text vertical position
  const greetingTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [140, 0], // Start below image, move up to center
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right']}>
      {/* Fixed Animated Header with Parallax */}
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: headerBackgroundColor,
            height: headerHeight,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }
        ]}
      >
        {/* Image with parallax movement */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            transform: [
              { translateX: imageTranslateX },
              { translateY: imageTranslateY }
            ],
          }}
        >
          <Animated.Image
            source={homePageImage}
            style={{
              width: imageWidth,
              height: imageHeight,
            }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Greeting text - positioned below image initially, moves to right on scroll */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            transform: [
              { translateX: greetingTranslateX },
              { translateY: greetingTranslateY }
            ],
          }}
        >
          <Animated.Text
            style={[
              styles.greeting,
              {
                color: textColor,
                fontSize: greetingFontSize,
                paddingHorizontal: 16,
              }
            ]}
          >
            Assalamu Alykom,{' '}
            <ThemedText style={styles.userName}>
              {user?.name || 'User Name'}
            </ThemedText>
          </Animated.Text>
        </Animated.View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingTop: HEADER_MAX_HEIGHT - insets.top, // Adjust for safe area to avoid double spacing
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
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="calendar" size={24} color="#F59E0B" />
              <ThemedText style={styles.sectionTitle}>Today's Schedule</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </View>

          <View style={styles.scheduleList}>
            {SCHEDULE_ITEMS.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.scheduleCard, { backgroundColor: cardBackground }]}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <ThemedText style={styles.scheduleSubject}>{item.subject}</ThemedText>
                <ThemedText style={styles.scheduleTime}>{item.time}</ThemedText>
              </Pressable>
            ))}
          </View>
        </ThemedView>

        {/* Students Section */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="people" size={24} color="#F59E0B" />
              <ThemedText style={styles.sectionTitle}>Students</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </View>

          <View style={styles.studentsList}>
            {STUDENTS.map((student) => (
              <Pressable
                key={student.id}
                style={[styles.studentCard, { backgroundColor: cardBackground }]}
              >
                <View style={styles.studentAvatar}>
                  <ThemedText style={styles.avatarEmoji}>{student.avatar}</ThemedText>
                </View>
                <ThemedText style={styles.studentName}>{student.name}</ThemedText>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
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
  header: {
    position: 'relative',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  greeting: {
    fontWeight: '600',
  },
  userName: {
    opacity: 0.6,
    fontSize: 14,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scheduleList: {
    gap: 12,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scheduleSubject: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  scheduleTime: {
    fontSize: 14,
    opacity: 0.6,
  },
  studentsList: {
    gap: 12,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  studentName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});
