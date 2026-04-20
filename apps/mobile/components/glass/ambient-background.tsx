import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { GlassTheme } from '@/constants/glass-theme';

interface AmbientBackgroundProps {
  children: ReactNode;
}

/**
 * Warm cream backdrop matching the HifzHub Glass design spec.
 *
 * The HTML prototype uses three blurred circular blobs over the base gradient:
 *   • Olive-green — top-left  (primary @ 28%, 60px blur)
 *   • Gold        — bottom-right (accent @ 32%, 70px blur)
 *   • Olive-green — mid-lower  (primary @ 18%, 80px blur)
 *
 * In React Native we approximate each blob with a radial-ish LinearGradient
 * that fans outward from the correct corner / position.  The key constraint is
 * NO warm gold in the upper half — that's what made the app look yellow.
 */
export function AmbientBackground({ children }: AmbientBackgroundProps) {
  return (
    <View style={styles.root}>
      {/* Base cream gradient — identical to design token bgGradient */}
      <LinearGradient
        colors={GlassTheme.bgGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Blob 1 — olive green, top-left (primary @ 0.28) */}
      <LinearGradient
        colors={['rgba(74,93,58,0.28)', 'rgba(74,93,58,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.65, y: 0.55 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Blob 2 — gold, bottom-right only (accent @ 0.20) */}
      <LinearGradient
        colors={['rgba(184,136,53,0.20)', 'rgba(184,136,53,0)']}
        start={{ x: 1, y: 1 }}
        end={{ x: 0.35, y: 0.45 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Blob 3 — olive green, mid-lower (primary @ 0.12) */}
      <LinearGradient
        colors={['rgba(74,93,58,0.12)', 'rgba(74,93,58,0)']}
        start={{ x: 0.3, y: 0.75 }}
        end={{ x: 0.8, y: 0.3 }}
        style={StyleSheet.absoluteFill}
      />

      {Platform.OS === 'ios' && (
        <BlurView
          intensity={55}
          tint="light"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GlassTheme.bg,
  },
});
