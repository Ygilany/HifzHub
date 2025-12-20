import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';

interface InfoCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  children: React.ReactNode;
}

export function InfoCard({ icon, iconColor, title, children }: InfoCardProps) {
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor || tintColor}15` }]}>
          <Ionicons name={icon} size={20} color={iconColor || tintColor} />
        </View>
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  action?: 'call' | 'email';
}

export function InfoRow({ label, value, action }: InfoRowProps) {
  const mutedColor = useThemeColor({}, 'mutedForeground');
  const tintColor = useThemeColor({}, 'tint');

  const handlePress = () => {
    if (action === 'call' && value) {
      Linking.openURL(`tel:${value}`);
    } else if (action === 'email' && value) {
      Linking.openURL(`mailto:${value}`);
    }
  };

  const content = (
    <View style={styles.row}>
      <ThemedText style={[styles.label, { color: mutedColor }]}>{label}</ThemedText>
      <ThemedText
        style={[
          styles.value,
          action && { color: tintColor },
        ]}
      >
        {value || '—'}
      </ThemedText>
    </View>
  );

  if (action && value) {
    return (
      <Pressable onPress={handlePress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
});
