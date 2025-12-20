import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: string | number;
  label: string;
  sublabel?: string;
}

export function StatCard({ icon, iconColor, value, label, sublabel }: StatCardProps) {
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const mutedColor = useThemeColor({}, 'mutedForeground');

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <ThemedText style={styles.value}>{value}</ThemedText>
      <ThemedText style={[styles.label, { color: mutedColor }]}>{label}</ThemedText>
      {sublabel && (
        <ThemedText style={[styles.sublabel, { color: mutedColor }]}>{sublabel}</ThemedText>
      )}
    </View>
  );
}

interface StatRowProps {
  children: React.ReactNode;
}

export function StatRow({ children }: StatRowProps) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  sublabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
    opacity: 0.7,
  },
});
