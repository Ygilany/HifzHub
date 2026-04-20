import { BlurView } from 'expo-blur';
import { ReactNode } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

import { GlassTheme } from '@/constants/glass-theme';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  borderColor?: string;
  borderWidth?: number;
  radius?: number;
  fillColor?: string;
}

/**
 * Translucent glass surface with iOS-native blur on top.
 * On Android (no native backdrop blur) we fall back to a tinted
 * fill, which still reads as a soft frosted card over the gradient bg.
 */
export function GlassCard({
  children,
  style,
  intensity = 90,
  tint = 'light',
  borderColor = GlassTheme.cardBorder,
  borderWidth = 0.5,
  radius = 18,
  fillColor = GlassTheme.card,
}: GlassCardProps) {
  const flatStyle = StyleSheet.flatten(style);

  if (Platform.OS === 'ios') {
    return (
      <View style={[{ borderRadius: radius, overflow: 'hidden' }, flatStyle]}>
        <BlurView
          intensity={intensity}
          tint={tint}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: fillColor, borderRadius: radius },
          ]}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radius,
              borderWidth,
              borderColor,
            },
          ]}
          pointerEvents="none"
        />
        <View style={{ flex: 0 }}>{children}</View>
      </View>
    );
  }

  // Android fallback — translucent fill, no real blur
  return (
    <View
      style={[
        {
          borderRadius: radius,
          backgroundColor: fillColor,
          borderWidth,
          borderColor,
          overflow: 'hidden',
        },
        flatStyle,
      ]}
    >
      {children}
    </View>
  );
}
