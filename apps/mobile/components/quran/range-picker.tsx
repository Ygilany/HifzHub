import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { GlassFonts, GlassTheme } from '@/constants/glass-theme';
import {
  quranRangeService,
  SurahInfo,
  SurahRange,
} from '@/lib/quran/quran-range-service';

type RangeMode = 'ayahs' | 'surahs' | 'pages';

interface RangePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (range: SurahRange) => void;
  initialRange?: SurahRange;
}

export function RangePicker({
  visible,
  onClose,
  onSelect,
  initialRange,
}: RangePickerProps) {
  const [mode, setMode] = useState<RangeMode>('ayahs');
  const [isLoading, setIsLoading] = useState(true);
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);

  const [startSurah, setStartSurah] = useState(initialRange?.startSurah || 1);
  const [startAyah, setStartAyah] = useState(initialRange?.startAyah || 1);
  const [endSurah, setEndSurah] = useState(initialRange?.endSurah || 1);
  const [endAyah, setEndAyah] = useState(initialRange?.endAyah || 1);
  const [startPage, setStartPage] = useState<number | null>(null);
  const [endPage, setEndPage] = useState<number | null>(null);

  const [showStartSurahPicker, setShowStartSurahPicker] = useState(false);
  const [showStartAyahPicker, setShowStartAyahPicker] = useState(false);
  const [showEndSurahPicker, setShowEndSurahPicker] = useState(false);
  const [showEndAyahPicker, setShowEndAyahPicker] = useState(false);

  useEffect(() => {
    if (visible) loadData();
  }, [visible]);

  useEffect(() => {
    if (initialRange) {
      setStartSurah(initialRange.startSurah);
      setStartAyah(initialRange.startAyah);
      setEndSurah(initialRange.endSurah);
      setEndAyah(initialRange.endAyah);
    }
  }, [initialRange]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await quranRangeService.initialize();
      setSurahs(quranRangeService.getAllSurahs());
      if (initialRange) {
        const pageRange = await quranRangeService.surahRangeToPageRange(initialRange);
        if (pageRange) {
          setStartPage(pageRange.startPage);
          setEndPage(pageRange.endPage);
        }
      }
    } catch (error) {
      console.error('Failed to load Quran data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (isStart: boolean, page: number) => {
    if (page < 1 || page > 604) return;
    const range = quranRangeService.getAyahRangeForPage(page);
    if (isStart) {
      setStartPage(page);
      if (range) {
        setStartSurah(range.start.surah);
        setStartAyah(range.start.ayah);
      }
    } else {
      setEndPage(page);
      if (range) {
        setEndSurah(range.end.surah);
        setEndAyah(range.end.ayah);
      }
    }
  };

  const handleSurahChange = (isStart: boolean, surah: number) => {
    const info = quranRangeService.getSurahInfo(surah);
    if (!info) return;
    if (isStart) {
      setStartSurah(surah);
      if (startAyah < info.firstAyah || startAyah > info.lastAyah) {
        setStartAyah(info.firstAyah);
      }
      if (endSurah === startSurah || endSurah < surah) {
        setEndSurah(surah);
        if (endAyah < info.firstAyah || endAyah > info.lastAyah) {
          setEndAyah(info.firstAyah);
        }
      }
    } else {
      setEndSurah(surah);
      if (endAyah < info.firstAyah || endAyah > info.lastAyah) {
        setEndAyah(info.firstAyah);
      }
    }
  };

  const handleAyahChange = (isStart: boolean, ayah: number) => {
    if (isStart) setStartAyah(ayah);
    else setEndAyah(ayah);
  };

  const stepAyah = (isStart: boolean, delta: number) => {
    const surah = isStart ? startSurah : endSurah;
    const info = quranRangeService.getSurahInfo(surah);
    if (!info) return;
    const current = isStart ? startAyah : endAyah;
    const next = Math.max(info.firstAyah, Math.min(info.lastAyah, current + delta));
    handleAyahChange(isStart, next);
  };

  const handleConfirm = async () => {
    await quranRangeService.initialize();
    const range: SurahRange = { startSurah, startAyah, endSurah, endAyah };
    if (quranRangeService.validateSurahRange(range)) {
      onSelect(range);
      onClose();
    } else {
      Alert.alert(
        'Invalid Range',
        'Please select a valid Quran range. The start must come before the end.',
        [{ text: 'OK' }],
      );
    }
  };

  const getCurrentSurahInfo = (surah: number) =>
    quranRangeService.getSurahInfo(surah);
  const getAyahsForCurrentSurah = (surah: number) =>
    quranRangeService.getAyahsForSurah(surah);

  if (isLoading) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassSheet>
            <ActivityIndicator size="large" color={GlassTheme.primary} />
            <Text style={styles.loadingText}>Loading Quran data...</Text>
          </GlassSheet>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <GlassSheet>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerEyebrow}>QURAN RANGE</Text>
              <Text style={styles.headerTitle}>Select range</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
              <Ionicons name="close" size={22} color={GlassTheme.ink} />
            </Pressable>
          </View>

          {/* Mode Selector — segmented glass pills */}
          <View style={styles.modeSelectorWrap}>
            <View style={styles.modeSelector}>
              {(['ayahs', 'surahs', 'pages'] as RangeMode[]).map((m) => {
                const active = mode === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMode(m)}
                    style={[styles.modeButton, active && styles.modeButtonActive]}
                  >
                    <Text
                      style={[
                        styles.modeButtonText,
                        active && styles.modeButtonTextActive,
                      ]}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* From */}
            <View style={styles.rangeSection}>
              <Text style={styles.sectionTitle}>FROM</Text>

              {mode === 'pages' ? (
                <PageInputRow
                  page={startPage}
                  onChangePage={(p) => handlePageChange(true, p)}
                  onClearPage={() => setStartPage(null)}
                  surahLabel={
                    startPage && startSurah && startAyah
                      ? `${getCurrentSurahInfo(startSurah)?.name} ${startAyah}`
                      : null
                  }
                />
              ) : (
                <View style={styles.fromToRow}>
                  <View style={styles.fromToField}>
                    <Text style={styles.label}>Surah</Text>
                    <SurahPickerButton
                      surah={startSurah}
                      surahName={getCurrentSurahInfo(startSurah)?.name}
                      onPress={() => setShowStartSurahPicker(true)}
                    />
                  </View>
                  {mode === 'ayahs' && (
                    <View style={styles.ayahFieldWrap}>
                      <Text style={styles.label}>Ayah</Text>
                      <AyahStepper
                        value={startAyah}
                        onDecrement={() => stepAyah(true, -1)}
                        onIncrement={() => stepAyah(true, 1)}
                        onPickerPress={() => setShowStartAyahPicker(true)}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* To */}
            <View style={styles.rangeSection}>
              <Text style={styles.sectionTitle}>TO</Text>

              {mode === 'pages' ? (
                <PageInputRow
                  page={endPage}
                  onChangePage={(p) => handlePageChange(false, p)}
                  onClearPage={() => setEndPage(null)}
                  placeholder="604"
                  surahLabel={
                    endPage && endSurah && endAyah
                      ? `${getCurrentSurahInfo(endSurah)?.name} ${endAyah}`
                      : null
                  }
                />
              ) : (
                <View style={styles.fromToRow}>
                  <View style={styles.fromToField}>
                    <Text style={styles.label}>Surah</Text>
                    <SurahPickerButton
                      surah={endSurah}
                      surahName={getCurrentSurahInfo(endSurah)?.name}
                      onPress={() => setShowEndSurahPicker(true)}
                    />
                  </View>
                  {mode === 'ayahs' && (
                    <View style={styles.ayahFieldWrap}>
                      <Text style={styles.label}>Ayah</Text>
                      <AyahStepper
                        value={endAyah}
                        onDecrement={() => stepAyah(false, -1)}
                        onIncrement={() => stepAyah(false, 1)}
                        onPickerPress={() => setShowEndAyahPicker(true)}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Summary card */}
            <View style={styles.summary}>
              <Text style={styles.summaryEyebrow}>SELECTED RANGE</Text>
              <Text style={styles.summaryDisplay}>
                {getCurrentSurahInfo(startSurah)?.name} {startAyah}
              </Text>
              <Text style={styles.summaryArrow}>↓</Text>
              <Text style={styles.summaryDisplay}>
                {getCurrentSurahInfo(endSurah)?.name} {endAyah}
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable onPress={onClose} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleConfirm} style={styles.primaryBtnWrap}>
              <LinearGradient
                colors={[GlassTheme.primaryGlass, GlassTheme.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>Confirm</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </GlassSheet>
      </View>

      <SurahPickerModal
        visible={showStartSurahPicker}
        surahs={surahs}
        selectedSurah={startSurah}
        onSelect={(surah) => {
          handleSurahChange(true, surah);
          setShowStartSurahPicker(false);
        }}
        onClose={() => setShowStartSurahPicker(false)}
      />
      <SurahPickerModal
        visible={showEndSurahPicker}
        surahs={surahs}
        selectedSurah={endSurah}
        onSelect={(surah) => {
          handleSurahChange(false, surah);
          setShowEndSurahPicker(false);
        }}
        onClose={() => setShowEndSurahPicker(false)}
      />

      <AyahPickerModal
        visible={showStartAyahPicker}
        surah={startSurah}
        selectedAyah={startAyah}
        ayahs={getAyahsForCurrentSurah(startSurah)}
        onSelect={(ayah) => {
          handleAyahChange(true, ayah);
          setShowStartAyahPicker(false);
        }}
        onClose={() => setShowStartAyahPicker(false)}
      />
      <AyahPickerModal
        visible={showEndAyahPicker}
        surah={endSurah}
        selectedAyah={endAyah}
        ayahs={getAyahsForCurrentSurah(endSurah)}
        onSelect={(ayah) => {
          handleAyahChange(false, ayah);
          setShowEndAyahPicker(false);
        }}
        onClose={() => setShowEndAyahPicker(false)}
      />
    </Modal>
  );
}

// ---------- subcomponents ----------

function GlassSheet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.sheet}>
      {Platform.OS === 'ios' && (
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      )}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(255,253,245,0.88)' },
        ]}
      />
      <View style={styles.sheetContent}>{children}</View>
    </View>
  );
}

function SurahPickerButton({
  surah,
  surahName,
  onPress,
}: {
  surah: number;
  surahName?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.pickerButton}>
      <View style={styles.pickerButtonContent}>
        <View style={styles.pickerButtonTextContainer}>
          <Text style={styles.pickerButtonNumber}>{surah}</Text>
          <Text style={styles.pickerButtonName} numberOfLines={1}>
            {surahName ?? '—'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={GlassTheme.inkSubtle} />
      </View>
    </Pressable>
  );
}

function AyahStepper({
  value,
  onDecrement,
  onIncrement,
  onPickerPress,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onPickerPress: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={onDecrement} style={styles.stepperBtn} hitSlop={4}>
        <Ionicons name="remove" size={18} color={GlassTheme.primary} />
      </Pressable>
      <Pressable onPress={onPickerPress} style={styles.stepperValue}>
        <Text style={styles.stepperValueText}>{value}</Text>
      </Pressable>
      <Pressable onPress={onIncrement} style={styles.stepperBtn} hitSlop={4}>
        <Ionicons name="add" size={18} color={GlassTheme.primary} />
      </Pressable>
    </View>
  );
}

function PageInputRow({
  page,
  onChangePage,
  onClearPage,
  surahLabel,
  placeholder = '1',
}: {
  page: number | null;
  onChangePage: (p: number) => void;
  onClearPage: () => void;
  surahLabel: string | null;
  placeholder?: string;
}) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.label}>Page</Text>
      <TextInput
        style={styles.numberInput}
        value={page?.toString() ?? ''}
        onChangeText={(v) => {
          const n = parseInt(v, 10);
          if (!isNaN(n) && n >= 1 && n <= 604) onChangePage(n);
          else if (v === '') onClearPage();
        }}
        placeholder={placeholder}
        placeholderTextColor={GlassTheme.inkSubtle}
        keyboardType="number-pad"
      />
      {surahLabel && <Text style={styles.ayahDisplay}>{surahLabel}</Text>}
    </View>
  );
}

function SurahPickerModal({
  visible,
  surahs,
  selectedSurah,
  onSelect,
  onClose,
}: {
  visible: boolean;
  surahs: SurahInfo[];
  selectedSurah: number;
  onSelect: (surah: number) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <GlassSheet>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerEyebrow}>SURAH</Text>
              <Text style={styles.headerTitle}>Select surah</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
              <Ionicons name="close" size={22} color={GlassTheme.ink} />
            </Pressable>
          </View>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {surahs.map((surah) => {
              const active = selectedSurah === surah.surah;
              return (
                <Pressable
                  key={surah.surah}
                  onPress={() => onSelect(surah.surah)}
                  style={[styles.surahPickerItem, active && styles.surahPickerItemActive]}
                >
                  <View style={styles.surahPickerItemContent}>
                    <View style={styles.surahPickerItemLeft}>
                      <Text style={styles.surahPickerNumber}>{surah.surah}</Text>
                      <View style={styles.surahPickerItemText}>
                        <Text style={styles.surahPickerName}>{surah.name}</Text>
                        <Text style={styles.surahPickerAyahCount}>
                          {surah.ayahCount} ayahs
                        </Text>
                      </View>
                    </View>
                    {active && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={GlassTheme.primary}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </GlassSheet>
      </View>
    </Modal>
  );
}

function AyahPickerModal({
  visible,
  surah,
  selectedAyah,
  ayahs,
  onSelect,
  onClose,
}: {
  visible: boolean;
  surah: number;
  selectedAyah: number;
  ayahs: number[];
  onSelect: (ayah: number) => void;
  onClose: () => void;
}) {
  const surahInfo = quranRangeService.getSurahInfo(surah);
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <GlassSheet>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerEyebrow}>AYAH</Text>
              <Text style={styles.headerTitle}>Select ayah</Text>
              {surahInfo && (
                <Text style={styles.headerSubtitle}>
                  {surahInfo.name} ({surah})
                </Text>
              )}
            </View>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
              <Ionicons name="close" size={22} color={GlassTheme.ink} />
            </Pressable>
          </View>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.ayahPickerGrid}
            showsVerticalScrollIndicator={false}
          >
            {ayahs.map((ayah) => {
              const active = selectedAyah === ayah;
              return (
                <Pressable
                  key={ayah}
                  onPress={() => onSelect(ayah)}
                  style={[
                    styles.ayahPickerItem,
                    active && styles.ayahPickerItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.ayahPickerItemText,
                      active && styles.ayahPickerItemTextActive,
                    ]}
                  >
                    {ayah}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </GlassSheet>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(28,30,20,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    maxHeight: '92%',
    minHeight: '70%',
    flexDirection: 'column',
    shadowColor: 'rgba(60,40,10,1)',
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
  sheetContent: {
    flex: 1,
    paddingTop: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 14,
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: GlassTheme.inkSubtle,
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: GlassFonts.display,
    fontSize: 28,
    fontWeight: '500',
    color: GlassTheme.ink,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: GlassTheme.inkMuted,
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeSelectorWrap: {
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(74,93,58,0.08)',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: GlassTheme.inkMuted,
  },
  modeButtonTextActive: {
    color: GlassTheme.primary,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  rangeSection: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: GlassTheme.inkSubtle,
    marginBottom: 10,
  },
  inputRow: {
    gap: 6,
  },
  fromToRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fromToField: { flex: 1.4 },
  ayahFieldWrap: { flex: 1 },
  label: {
    fontSize: 11,
    color: GlassTheme.inkSubtle,
    marginBottom: 6,
    fontWeight: '500',
  },
  numberInput: {
    height: 48,
    borderWidth: 0.5,
    borderColor: GlassTheme.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: GlassTheme.ink,
    textAlign: 'center',
    fontWeight: '600',
  },
  ayahDisplay: {
    fontSize: 12,
    color: GlassTheme.inkMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  pickerButton: {
    minHeight: 56,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 0.5,
    borderColor: GlassTheme.cardBorder,
    justifyContent: 'center',
  },
  pickerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerButtonTextContainer: { flex: 1, minWidth: 0 },
  pickerButtonNumber: {
    fontFamily: GlassFonts.display,
    fontSize: 18,
    color: GlassTheme.ink,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  pickerButtonName: {
    fontSize: 12,
    color: GlassTheme.inkMuted,
    marginTop: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 0.5,
    borderColor: GlassTheme.cardBorder,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 38,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: GlassTheme.line,
  },
  stepperValueText: {
    fontFamily: GlassFonts.display,
    fontSize: 22,
    fontWeight: '500',
    color: GlassTheme.ink,
    letterSpacing: -0.3,
  },
  summary: {
    marginTop: 8,
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: GlassTheme.primarySoft,
    borderWidth: 0.5,
    borderColor: 'rgba(74,93,58,0.25)',
    gap: 4,
  },
  summaryEyebrow: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: GlassTheme.primary,
    marginBottom: 6,
  },
  summaryDisplay: {
    fontFamily: GlassFonts.display,
    fontSize: 20,
    fontWeight: '500',
    color: GlassTheme.ink,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  summaryArrow: {
    color: GlassTheme.inkSubtle,
    fontSize: 16,
    marginVertical: 2,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: GlassTheme.line,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: GlassTheme.primarySoft,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: GlassTheme.primary,
  },
  primaryBtnWrap: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // Surah picker list
  surahPickerItem: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GlassTheme.line,
  },
  surahPickerItemActive: {
    backgroundColor: GlassTheme.primarySoft,
  },
  surahPickerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  surahPickerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  surahPickerNumber: {
    fontFamily: GlassFonts.display,
    fontSize: 22,
    fontWeight: '500',
    color: GlassTheme.primary,
    width: 44,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  surahPickerItemText: {
    flex: 1,
    marginLeft: 10,
  },
  surahPickerName: {
    fontSize: 15,
    fontWeight: '600',
    color: GlassTheme.ink,
    marginBottom: 2,
  },
  surahPickerAyahCount: {
    fontSize: 12,
    color: GlassTheme.inkMuted,
  },

  // Ayah picker grid
  ayahPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 18,
    gap: 8,
  },
  ayahPickerItem: {
    width: 56,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 0.5,
    borderColor: GlassTheme.cardBorder,
  },
  ayahPickerItemActive: {
    backgroundColor: GlassTheme.primary,
    borderColor: GlassTheme.primary,
  },
  ayahPickerItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: GlassTheme.ink,
  },
  ayahPickerItemTextActive: { color: '#fff' },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: GlassTheme.inkMuted,
    textAlign: 'center',
  },
});
