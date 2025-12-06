import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

interface SectionHeaderProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  iconColor?: string;
  showChevron?: boolean;
}

export function SectionHeader({ icon, title, iconColor = '#F59E0B', showChevron = true }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name={icon} size={24} color={iconColor} />
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />}
    </View>
  );
}

const styles = StyleSheet.create({
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
});

