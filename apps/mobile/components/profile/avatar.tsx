import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, View } from 'react-native';

interface AvatarProps {
  name?: string;
  size?: number;
}

export function Avatar({ name, size = 80 }: AvatarProps) {
  const tintColor = useThemeColor({}, 'tint');
  const initial = name?.charAt(0).toUpperCase() || 'U';

  return (
    <View style={[styles.avatarContainer, { backgroundColor: tintColor, width: size, height: size, borderRadius: size / 2 }]}>
      <ThemedText style={[styles.avatarText, { fontSize: size * 0.4, lineHeight: size * 0.48 }]}>{initial}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    includeFontPadding: false,
  },
});

