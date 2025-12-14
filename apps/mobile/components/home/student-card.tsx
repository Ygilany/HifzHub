import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

interface StudentCardProps {
  name: string;
  avatar: string;
  onPress?: () => void;
}

export function StudentCard({ name, avatar, onPress }: StudentCardProps) {
  const cardBackground = useThemeColor({ light: '#FFF5E6', dark: '#2A2A2A' }, 'card');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.studentCard, 
        { backgroundColor: cardBackground },
        pressed && styles.pressed
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.studentAvatar}>
        <ThemedText style={styles.avatarEmoji}>{avatar}</ThemedText>
      </View>
      <ThemedText style={styles.studentName}>{name}</ThemedText>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  pressed: {
    opacity: 0.7,
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

