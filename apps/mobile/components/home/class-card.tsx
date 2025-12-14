import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

interface ClassCardProps {
  name: string;
  description?: string | null;
  studentCount?: number;
  onPress?: () => void;
}

export function ClassCard({ name, description, studentCount, onPress }: ClassCardProps) {
  const cardBackground = useThemeColor({ light: '#FFF5E6', dark: '#2A2A2A' }, 'card');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.classCard, 
        { backgroundColor: cardBackground },
        pressed && styles.pressed
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: '#3B82F620' }]}>
        <Ionicons name="school-outline" size={24} color="#3B82F6" />
      </View>
      <View style={styles.classInfo}>
        <ThemedText style={styles.className}>{name}</ThemedText>
        {description && (
          <ThemedText style={styles.classDescription} numberOfLines={1}>
            {description}
          </ThemedText>
        )}
        {studentCount !== undefined && (
          <ThemedText style={styles.studentCount}>
            {studentCount} {studentCount === 1 ? 'student' : 'students'}
          </ThemedText>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  classCard: {
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  classDescription: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
  },
  studentCount: {
    fontSize: 12,
    opacity: 0.5,
  },
});
