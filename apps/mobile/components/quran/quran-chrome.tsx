import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GlassFonts, GlassTheme } from '@/constants/glass-theme';
import { WordMarkingType } from './quran-page';

export type MistakeKey = 'memory' | 'tashkeel' | 'tajweed';

const MISTAKE_META: Record<MistakeKey, { color: string; soft: string; label: string; letter: string }> = {
  memory:   { color: '#c75d2c', soft: 'rgba(199,93,44,0.28)',  label: 'Memorization', letter: 'M' },
  tashkeel: { color: '#d89830', soft: 'rgba(216,152,48,0.32)', label: 'Tashkeel',     letter: 'T' },
  tajweed:  { color: '#d4b847', soft: 'rgba(212,184,71,0.38)', label: 'Tajweed',      letter: 'J' },
};

// Map the existing WordMarkingType (tajweed/tasheel/hifz/corrected) onto
// the design's three mistake categories. "corrected" falls outside this set
// and is treated as positive feedback rather than a mistake count.
export const MARKING_TO_MISTAKE: Record<WordMarkingType, MistakeKey | null> = {
  hifz: 'memory',
  tasheel: 'tashkeel',
  tajweed: 'tajweed',
  corrected: null,
};

export type MistakeCounts = Record<MistakeKey, number>;

export function emptyCounts(): MistakeCounts {
  return { memory: 0, tashkeel: 0, tajweed: 0 };
}

export function tallyMarkings(markings: Map<string, WordMarkingType>): MistakeCounts {
  const counts = emptyCounts();
  for (const m of markings.values()) {
    const key = MARKING_TO_MISTAKE[m];
    if (key) counts[key] += 1;
  }
  return counts;
}

interface QuranTopPillProps {
  visible: boolean;
  studentName: string;
  pageInfo: string;
  totalMarks: number;
  onBack: () => void;
  onReview: () => void;
  top?: number;
}

export function QuranTopPill({
  visible,
  studentName,
  pageInfo,
  totalMarks,
  onBack,
  onReview,
  top = 0,
}: QuranTopPillProps) {
  const anim = useFade(visible);
  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.topPillWrap,
        { top },
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }),
            },
          ],
        },
      ]}
    >
      <GlassPill>
        <Pressable onPress={onBack} style={styles.iconBtn} hitSlop={6}>
          <Ionicons name="chevron-back" size={18} color="#3a2a15" />
        </Pressable>
        <View style={styles.topPillCenter}>
          <Text style={styles.topPillName} numberOfLines={1}>
            {studentName}
          </Text>
          <Text style={styles.topPillSub} numberOfLines={1}>
            {pageInfo}
          </Text>
        </View>
        <Pressable onPress={onReview} hitSlop={4}>
          {totalMarks > 0 ? (
            <LinearGradient
              colors={[GlassTheme.accentGlass, GlassTheme.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.reviewActive}
            >
              <Text style={styles.reviewActiveCount}>{totalMarks}</Text>
              <Text style={styles.reviewActiveLabel}>Review</Text>
            </LinearGradient>
          ) : (
            <View style={styles.reviewIdle}>
              <Text style={styles.reviewIdleLabel}>Review</Text>
            </View>
          )}
        </Pressable>
      </GlassPill>
    </Animated.View>
  );
}

interface QuranBottomDockProps {
  visible: boolean;
  counts: MistakeCounts;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onRecord?: () => void;
  bottom?: number;
}

export function QuranBottomDock({
  visible,
  counts,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onRecord,
  bottom = 0,
}: QuranBottomDockProps) {
  const anim = useFade(visible);
  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.dockWrap,
        { bottom },
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }),
            },
          ],
        },
      ]}
    >
      <GlassDock>
        <DockIconBtn
          icon="chevron-back"
          onPress={onPrev}
          disabled={!canPrev}
        />
        <DockDivider />
        <CountPill k="memory" n={counts.memory} />
        <CountPill k="tashkeel" n={counts.tashkeel} />
        <CountPill k="tajweed" n={counts.tajweed} />
        <DockDivider />
        <DockIconBtn icon="mic" onPress={onRecord} accent />
        <DockIconBtn
          icon="chevron-forward"
          onPress={onNext}
          disabled={!canNext}
        />
      </GlassDock>
    </Animated.View>
  );
}

interface SummarySheetProps {
  visible: boolean;
  studentName: string;
  pageInfo: string;
  counts: MistakeCounts;
  onClose: () => void;
  /** Called when teacher taps "Save session". Only shown when canSave is true. */
  onSave?: () => void;
  isSaving?: boolean;
  canSave?: boolean;
}

export function SummarySheet({
  visible,
  studentName,
  pageInfo,
  counts,
  onClose,
  onSave,
  isSaving = false,
  canSave = false,
}: SummarySheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable style={styles.sheetCard} onPress={() => {}}>
          {Platform.OS === 'ios' && (
            <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
          )}
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(255,253,245,0.85)' },
            ]}
          />
          <View>
            <View style={styles.sheetGrabber} />
            <Text style={styles.sheetTitle}>Review summary</Text>
            <Text style={styles.sheetSubtitle}>
              {studentName} · {pageInfo}
            </Text>
            <View style={styles.sheetBody}>
              {(['memory', 'tashkeel', 'tajweed'] as MistakeKey[]).map((k) => {
                const meta = MISTAKE_META[k];
                return (
                  <View key={k} style={styles.summaryRow}>
                    <View
                      style={[
                        styles.summaryLetter,
                        { backgroundColor: meta.color + '22' },
                      ]}
                    >
                      <Text style={[styles.summaryLetterText, { color: meta.color }]}>
                        {meta.letter}
                      </Text>
                    </View>
                    <Text style={styles.summaryLabel}>{meta.label}</Text>
                    <Text style={[styles.summaryCount, { color: meta.color }]}>
                      {counts[k]}
                    </Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.sheetActions}>
              <Pressable onPress={onClose} style={styles.sheetSecondary}>
                <Text style={styles.sheetSecondaryText}>Keep reviewing</Text>
              </Pressable>
              {canSave && (
                <Pressable
                  onPress={onSave}
                  disabled={isSaving}
                  style={[styles.sheetPrimaryWrap, isSaving && { opacity: 0.6 }]}
                >
                  <LinearGradient
                    colors={[GlassTheme.primaryGlass, GlassTheme.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sheetPrimary}
                  >
                    <Text style={styles.sheetPrimaryText}>
                      {isSaving ? 'Saving…' : 'Save session'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              )}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------- helpers ----------

function useFade(visible: boolean) {
  const value = useRef(new Animated.Value(visible ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(value, {
      toValue: visible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, value]);
  return value;
}

function GlassPill({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.pill}>
      {Platform.OS === 'ios' && (
        <BlurView intensity={45} tint="light" style={StyleSheet.absoluteFill} />
      )}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(255,249,232,0.55)' },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderWidth: 0.5,
            borderColor: 'rgba(255,255,255,0.55)',
            borderRadius: 22,
          },
        ]}
      />
      <View style={styles.pillContent}>{children}</View>
    </View>
  );
}

function GlassDock({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.dock}>
      {Platform.OS === 'ios' && (
        <BlurView intensity={45} tint="light" style={StyleSheet.absoluteFill} />
      )}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(255,249,232,0.55)' },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderWidth: 0.5,
            borderColor: 'rgba(255,255,255,0.55)',
            borderRadius: 999,
          },
        ]}
      />
      <View style={styles.dockContent}>{children}</View>
    </View>
  );
}

function DockIconBtn({
  icon,
  onPress,
  disabled,
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
  accent?: boolean;
}) {
  if (accent) {
    return (
      <Pressable onPress={onPress} disabled={disabled} hitSlop={4}>
        <LinearGradient
          colors={[GlassTheme.accent, GlassTheme.accentGlass]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.dockBtnAccent}
        >
          <Ionicons name={icon} size={18} color="#fff" />
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
      style={[styles.dockBtn, disabled && { opacity: 0.4 }]}
    >
      <Ionicons name={icon} size={18} color="#3a2a15" />
    </Pressable>
  );
}

function DockDivider() {
  return <View style={styles.dockDivider} />;
}

function CountPill({ k, n }: { k: MistakeKey; n: number }) {
  const m = MISTAKE_META[k];
  return (
    <View style={styles.countPill}>
      <View style={[styles.countDot, { backgroundColor: m.color }]} />
      <Text style={[styles.countText, { color: n > 0 ? m.color : '#a8957a' }]}>{n}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topPillWrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 30,
  },
  pill: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: 'rgba(60,40,10,1)',
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  topPillCenter: { flex: 1, alignItems: 'center' },
  topPillName: {
    fontFamily: GlassFonts.display,
    fontSize: 16,
    color: '#3a2a15',
    fontWeight: '500',
    letterSpacing: -0.4,
  },
  topPillSub: {
    fontSize: 10,
    color: '#5a3e1a',
    opacity: 0.75,
    fontWeight: '500',
  },
  reviewActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  reviewActiveCount: { color: '#fff', fontSize: 11, fontWeight: '700' },
  reviewActiveLabel: { color: '#fff', fontSize: 12, fontWeight: '600' },
  reviewIdle: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  reviewIdleLabel: { color: '#5a3e1a', fontSize: 12, fontWeight: '600' },

  dockWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 30,
  },
  dock: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: 'rgba(60,40,10,1)',
    shadowOpacity: 0.2,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  dockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  dockBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockBtnAccent: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GlassTheme.accent,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  dockDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(90,62,26,0.2)',
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    height: 40,
  },
  countDot: { width: 7, height: 7, borderRadius: 3.5 },
  countText: { fontSize: 12, fontWeight: '600', minWidth: 8, textAlign: 'center' },

  // Sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 40,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  sheetGrabber: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: GlassTheme.inkSubtle,
    opacity: 0.3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: GlassFonts.display,
    fontSize: 26,
    fontWeight: '500',
    color: GlassTheme.ink,
    letterSpacing: -0.4,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: GlassTheme.inkMuted,
    marginTop: 4,
  },
  sheetBody: { marginTop: 20 },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GlassTheme.line,
  },
  summaryLetter: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLetterText: { fontSize: 15, fontWeight: '700' },
  summaryLabel: { flex: 1, fontSize: 15, color: GlassTheme.ink },
  summaryCount: { fontFamily: GlassFonts.display, fontSize: 22, fontWeight: '600' },

  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  sheetSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: GlassTheme.primarySoft,
    alignItems: 'center',
  },
  sheetSecondaryText: { color: GlassTheme.primary, fontWeight: '600', fontSize: 15 },
  sheetPrimaryWrap: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  sheetPrimary: {
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  sheetPrimaryText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});

// re-export ScrollView re-use silencer (ScrollView import was needed above for sheet body if it grows)
export const _Scroll = ScrollView;
