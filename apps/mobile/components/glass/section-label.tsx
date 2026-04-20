import { StyleSheet, Text, TextStyle } from 'react-native';

import { GlassTheme } from '@/constants/glass-theme';

interface SectionLabelProps {
  children: string;
  style?: TextStyle;
}

export function SectionLabel({ children, style }: SectionLabelProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    letterSpacing: 0.8,
    fontWeight: '600',
    color: GlassTheme.inkSubtle,
  },
});
