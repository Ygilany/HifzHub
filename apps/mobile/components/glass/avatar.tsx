import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { GlassTheme } from '@/constants/glass-theme';

interface GlassAvatarProps {
  name: string;
  size?: number;
  color?: string;
}

export function GlassAvatar({ name, size = 40, color = GlassTheme.primary }: GlassAvatarProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .filter(Boolean)
    .join('')
    .toUpperCase();

  // Build "color → color + alpha" gradient (mimics 145deg, color, color bb)
  const start = color;
  const end = withAlpha(color, 0.73);

  return (
    <LinearGradient
      colors={[start, end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <View style={[StyleSheet.absoluteFill, styles.innerHighlight, { borderRadius: size / 2 }]} />
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </LinearGradient>
  );
}

function withAlpha(hex: string, alpha: number): string {
  const sanitized = hex.replace('#', '');
  if (sanitized.length !== 6) return hex;
  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerHighlight: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
  },
  initials: {
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
