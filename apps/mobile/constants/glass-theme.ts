/**
 * HifzHub Glass design tokens — iOS Liquid Glass aesthetic.
 * Olive & Cream palette, warm/serene, calligraphic-leaning typography.
 * Adapted from the Claude Design "HifzHub Glass" prototype.
 */

import { Platform } from 'react-native';

export const GlassTheme = {
  bg: '#edeae0',
  bgGradient: ['#f6f4ee', '#e8e3d5', '#d8d2be'] as const,

  surface: 'rgba(255,255,255,0.50)',
  surfaceSolid: '#fdfcf8',

  card: 'rgba(255,255,255,0.58)',
  cardBorder: 'rgba(255,255,255,0.55)',

  glassTint: 'rgba(255,249,232,0.35)',
  glassBorder: 'rgba(255,255,255,0.45)',

  ink: '#1f2a1a',
  inkMuted: '#5e6a55',
  inkSubtle: '#8a907f',

  primary: '#4a5d3a',
  primaryGlass: 'rgba(74,93,58,0.62)',
  primarySoft: 'rgba(74,93,58,0.18)',

  accent: '#b88835',
  accentGlass: 'rgba(184,136,53,0.9)',
  accentSoft: 'rgba(184,136,53,0.18)',

  line: 'rgba(60,70,50,0.1)',
  error: '#b4502e',

  // Mistake palette (matches existing MARKING_CONFIG semantics with prettier hues)
  mistake: {
    memory:   { color: '#c75d2c', soft: 'rgba(199,93,44,0.28)', label: 'Memorization', short: 'Memory',   letter: 'M' },
    tashkeel: { color: '#d89830', soft: 'rgba(216,152,48,0.32)', label: 'Tashkeel',     short: 'Tashkeel', letter: 'T' },
    tajweed:  { color: '#d4b847', soft: 'rgba(212,184,71,0.38)', label: 'Tajweed',      short: 'Tajweed',  letter: 'J' },
  },
} as const;

export const GlassFonts = {
  display: 'CormorantGaramond_500Medium',
  displayRegular: 'CormorantGaramond_400Regular',
  displaySemiBold: 'CormorantGaramond_600SemiBold',
  displayItalic: 'CormorantGaramond_500Medium_Italic',
  body: Platform.select({ ios: 'System', android: 'normal', default: 'sans-serif' })!,
} as const;

export const GlassRadius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

// Helper: build a glass surface style block with shadow + border
export const glassSurface = (opts?: { tint?: string; border?: string }) => ({
  backgroundColor: opts?.tint ?? GlassTheme.card,
  borderWidth: 0.5,
  borderColor: opts?.border ?? GlassTheme.cardBorder,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 4,
});
