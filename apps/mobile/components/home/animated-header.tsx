import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Dimensions } from 'react-native';
import { Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth/context';

const { width } = Dimensions.get('window');

// Header constants
const HEADER_MAX_HEIGHT = 400;
const HEADER_MIN_HEIGHT = 150;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

interface AnimatedHeaderProps {
  scrollY: Animated.Value;
}

export function AnimatedHeader({ scrollY }: AnimatedHeaderProps) {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, 'text');
  const insets = useSafeAreaInsets();

  // Dark mode support
  const isDark = colorScheme === 'dark';
  const headerBackgroundColor = isDark ? '#13212B' : '#FED7AE';
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
    outputRange: [width * 0.85, 70],
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
    outputRange: [0, -(width / 2 - 80)],
    extrapolate: 'clamp',
  });

  // Image vertical position - move up when scrolled
  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [-20, 0],
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
    outputRange: [0, 10],
    extrapolate: 'clamp',
  });

  // Text vertical position
  const greetingTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [140, 10],
    extrapolate: 'clamp',
  });

  return (
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
        },
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
            { translateY: imageTranslateY },
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
            { translateY: greetingTranslateY },
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
            },
          ]}
        >
          Assalamu Alykom, {user?.name || 'User Name'}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

export const HEADER_MAX_HEIGHT_EXPORT = HEADER_MAX_HEIGHT;
export const HEADER_SCROLL_DISTANCE_EXPORT = HEADER_SCROLL_DISTANCE;

const styles = StyleSheet.create({
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
});

