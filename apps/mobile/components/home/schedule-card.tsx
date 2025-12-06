import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

interface ScheduleCardProps {
  subject: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
}

export function ScheduleCard({ subject, time, icon, color, onPress }: ScheduleCardProps) {
  const cardBackground = useThemeColor({ light: '#FFF5E6', dark: '#2A2A2A' }, 'card');

  return (
    <Pressable
      style={[styles.scheduleCard, { backgroundColor: cardBackground }]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <ThemedText style={styles.scheduleSubject}>{subject}</ThemedText>
      <ThemedText style={styles.scheduleTime}>{time}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
});

