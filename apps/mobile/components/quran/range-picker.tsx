import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { quranRangeService, SurahInfo, SurahRange } from '@/lib/quran/quran-range-service';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

type RangeMode = 'ayahs' | 'surahs' | 'pages';

interface RangePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (range: SurahRange) => void;
  initialRange?: SurahRange;
}

export function RangePicker({ visible, onClose, onSelect, initialRange }: RangePickerProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'mutedForeground');
  const tintColor = useThemeColor({}, 'tint');

  const [mode, setMode] = useState<RangeMode>('ayahs');
  const [isLoading, setIsLoading] = useState(true);
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);

  // Range state
  const [startSurah, setStartSurah] = useState(initialRange?.startSurah || 1);
  const [startAyah, setStartAyah] = useState(initialRange?.startAyah || 1);
  const [endSurah, setEndSurah] = useState(initialRange?.endSurah || 1);
  const [endAyah, setEndAyah] = useState(initialRange?.endAyah || 1);
  const [startPage, setStartPage] = useState<number | null>(null);
  const [endPage, setEndPage] = useState<number | null>(null);
  
  // Selection modals
  const [showStartSurahPicker, setShowStartSurahPicker] = useState(false);
  const [showStartAyahPicker, setShowStartAyahPicker] = useState(false);
  const [showEndSurahPicker, setShowEndSurahPicker] = useState(false);
  const [showEndAyahPicker, setShowEndAyahPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      loadData();
    }
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
      const allSurahs = quranRangeService.getAllSurahs();
      setSurahs(allSurahs);

      // If we have initial range, convert to pages
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

    try {
      if (isStart) {
        setStartPage(page);
        const range = quranRangeService.getAyahRangeForPage(page);
        if (range) {
          setStartSurah(range.start.surah);
          setStartAyah(range.start.ayah);
        }
      } else {
        setEndPage(page);
        const range = quranRangeService.getAyahRangeForPage(page);
        if (range) {
          setEndSurah(range.end.surah);
          setEndAyah(range.end.ayah);
        }
      }
    } catch (error) {
      console.error('Error updating page range:', error);
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
      // Auto-populate end surah with the same value if it's not set or if it's the same as start
      if (endSurah === startSurah || endSurah < surah) {
        setEndSurah(surah);
        // Also update end ayah if needed
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
    if (isStart) {
      setStartAyah(ayah);
    } else {
      setEndAyah(ayah);
    }
  };

  const handleConfirm = async () => {
    // Ensure service is initialized
    await quranRangeService.initialize();
    
    const range: SurahRange = {
      startSurah,
      startAyah,
      endSurah,
      endAyah,
    };

    console.log('Range picker - confirming range:', range);
    const isValid = quranRangeService.validateSurahRange(range);
    console.log('Range validation result:', isValid);
    
    if (isValid) {
      console.log('Calling onSelect with range:', range);
      onSelect(range);
      onClose();
    } else {
      // Show error if validation fails
      console.warn('Range validation failed:', range);
      Alert.alert(
        'Invalid Range',
        'Please select a valid Quran range. The start must come before the end.',
        [{ text: 'OK' }]
      );
    }
  };

  const getCurrentSurahInfo = (surah: number): SurahInfo | null => {
    return quranRangeService.getSurahInfo(surah);
  };

  const getAyahsForCurrentSurah = (surah: number): number[] => {
    return quranRangeService.getAyahsForSurah(surah);
  };

  if (isLoading) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: cardColor }]}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={[styles.loadingText, { color: mutedColor }]}>
              Loading Quran data...
            </ThemedText>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: cardColor }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <ThemedText style={styles.headerTitle}>Select Quran Range</ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </Pressable>
          </View>

          {/* Mode Selector */}
          <View style={styles.modeSelector}>
            {(['ayahs', 'surahs', 'pages'] as RangeMode[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                style={[
                  styles.modeButton,
                  {
                    backgroundColor: mode === m ? tintColor : 'transparent',
                    borderColor: mode === m ? tintColor : borderColor,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.modeButtonText,
                    { color: mode === m ? '#fff' : textColor },
                  ]}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Start Range */}
            <View style={[styles.rangeSection, mode === 'ayahs' && styles.rangeSectionCompact]}>
              <ThemedText style={[styles.sectionTitle, mode === 'ayahs' && styles.sectionTitleCompact, { color: mutedColor }]}>
                From
              </ThemedText>

              {mode === 'pages' && (
                <View style={styles.inputRow}>
                  <ThemedText style={[styles.label, { color: mutedColor }]}>Page</ThemedText>
                  <TextInput
                    style={[styles.numberInput, { borderColor, color: textColor }]}
                    value={startPage?.toString() || ''}
                    onChangeText={(v) => {
                      const page = parseInt(v, 10);
                      if (!isNaN(page) && page >= 1 && page <= 604) {
                        handlePageChange(true, page);
                      } else if (v === '') {
                        setStartPage(null);
                      }
                    }}
                    placeholder="1"
                    placeholderTextColor={mutedColor}
                    keyboardType="number-pad"
                  />
                  {startPage && startSurah && startAyah && (
                    <ThemedText style={[styles.ayahDisplay, { color: mutedColor }]}>
                      {getCurrentSurahInfo(startSurah)?.name} {startAyah}
                    </ThemedText>
                  )}
                </View>
              )}

              {(mode === 'ayahs' || mode === 'surahs') && (
                <View style={[styles.fromToRow, mode === 'ayahs' && styles.fromToRowCompact]}>
                  <View style={styles.fromToField}>
                    <ThemedText style={[styles.label, { color: mutedColor }]}>Surah</ThemedText>
                    <Pressable
                      onPress={() => setShowStartSurahPicker(true)}
                      style={[styles.pickerButton, { borderColor, backgroundColor: cardColor }]}
                    >
                      <View style={styles.pickerButtonContent}>
                        <View style={styles.pickerButtonTextContainer}>
                          <ThemedText style={styles.pickerButtonNumber}>{startSurah}</ThemedText>
                          <ThemedText style={[styles.pickerButtonName, { color: mutedColor }]} numberOfLines={1}>
                            {getCurrentSurahInfo(startSurah)?.name}
                          </ThemedText>
                        </View>
                        <Ionicons name="chevron-down" size={20} color={mutedColor} />
                      </View>
                    </Pressable>
                  </View>

                  {mode === 'ayahs' && (
                    <View style={styles.fromToField}>
                      <ThemedText style={[styles.label, { color: mutedColor }]}>Ayah</ThemedText>
                      <Pressable
                        onPress={() => setShowStartAyahPicker(true)}
                        style={[styles.pickerButton, { borderColor, backgroundColor: cardColor }]}
                      >
                        <View style={styles.pickerButtonContent}>
                          <ThemedText style={styles.pickerButtonNumber}>{startAyah}</ThemedText>
                          <Ionicons name="chevron-down" size={20} color={mutedColor} />
                        </View>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* End Range */}
            <View style={[styles.rangeSection, mode === 'ayahs' && styles.rangeSectionCompact]}>
              <ThemedText style={[styles.sectionTitle, mode === 'ayahs' && styles.sectionTitleCompact, { color: mutedColor }]}>To</ThemedText>

              {mode === 'pages' && (
                <View style={styles.inputRow}>
                  <ThemedText style={[styles.label, { color: mutedColor }]}>Page</ThemedText>
                  <TextInput
                    style={[styles.numberInput, { borderColor, color: textColor }]}
                    value={endPage?.toString() || ''}
                    onChangeText={(v) => {
                      const page = parseInt(v, 10);
                      if (!isNaN(page) && page >= 1 && page <= 604) {
                        handlePageChange(false, page);
                      } else if (v === '') {
                        setEndPage(null);
                      }
                    }}
                    placeholder="604"
                    placeholderTextColor={mutedColor}
                    keyboardType="number-pad"
                  />
                  {endPage && endSurah && endAyah && (
                    <ThemedText style={[styles.ayahDisplay, { color: mutedColor }]}>
                      {getCurrentSurahInfo(endSurah)?.name} {endAyah}
                    </ThemedText>
                  )}
                </View>
              )}

              {(mode === 'ayahs' || mode === 'surahs') && (
                <View style={[styles.fromToRow, mode === 'ayahs' && styles.fromToRowCompact]}>
                  <View style={styles.fromToField}>
                    <ThemedText style={[styles.label, { color: mutedColor }]}>Surah</ThemedText>
                    <Pressable
                      onPress={() => setShowEndSurahPicker(true)}
                      style={[styles.pickerButton, { borderColor, backgroundColor: cardColor }]}
                    >
                      <View style={styles.pickerButtonContent}>
                        <View style={styles.pickerButtonTextContainer}>
                          <ThemedText style={styles.pickerButtonNumber}>{endSurah}</ThemedText>
                          <ThemedText style={[styles.pickerButtonName, { color: mutedColor }]} numberOfLines={1}>
                            {getCurrentSurahInfo(endSurah)?.name}
                          </ThemedText>
                        </View>
                        <Ionicons name="chevron-down" size={20} color={mutedColor} />
                      </View>
                    </Pressable>
                  </View>

                  {mode === 'ayahs' && (
                    <View style={styles.fromToField}>
                      <ThemedText style={[styles.label, { color: mutedColor }]}>Ayah</ThemedText>
                      <Pressable
                        onPress={() => setShowEndAyahPicker(true)}
                        style={[styles.pickerButton, { borderColor, backgroundColor: cardColor }]}
                      >
                        <View style={styles.pickerButtonContent}>
                          <ThemedText style={styles.pickerButtonNumber}>{endAyah}</ThemedText>
                          <Ionicons name="chevron-down" size={20} color={mutedColor} />
                        </View>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Summary */}
            <View style={[styles.summary, { backgroundColor: `${tintColor}15`, borderColor }]}>
              <ThemedText style={[styles.summaryTitle, { color: mutedColor }]}>
                Selected Range
              </ThemedText>
              <ThemedText style={styles.summaryText}>
                {getCurrentSurahInfo(startSurah)?.name} {startAyah}
              </ThemedText>
              <ThemedText style={[styles.summaryText, { color: mutedColor }]}>to</ThemedText>
              <ThemedText style={styles.summaryText}>
                {getCurrentSurahInfo(endSurah)?.name} {endAyah}
              </ThemedText>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: borderColor }]}>
            <Pressable
              onPress={onClose}
              style={[styles.footerButton, { borderColor }]}
            >
              <ThemedText style={[styles.footerButtonText, { color: textColor }]}>
                Cancel
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              style={[styles.footerButton, { backgroundColor: tintColor }]}
            >
              <ThemedText style={[styles.footerButtonText, { color: '#fff' }]}>
                Confirm
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Surah Picker Modals */}
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

      {/* Ayah Picker Modals */}
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

// Surah Picker Modal Component
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
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'mutedForeground');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.pickerModalContent, { backgroundColor: cardColor }]}>
          <View style={[styles.pickerHeader, { borderBottomColor: borderColor }]}>
            <ThemedText style={styles.pickerHeaderTitle}>Select Surah</ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </Pressable>
          </View>
          <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={true}>
            {surahs.map((surah) => (
              <Pressable
                key={surah.surah}
                onPress={() => onSelect(surah.surah)}
                style={[
                  styles.surahPickerItem,
                  {
                    backgroundColor: selectedSurah === surah.surah ? `${tintColor}15` : 'transparent',
                    borderLeftColor: selectedSurah === surah.surah ? tintColor : 'transparent',
                  },
                ]}
              >
                <View style={styles.surahPickerItemContent}>
                  <View style={styles.surahPickerItemLeft}>
                    <ThemedText style={[styles.surahPickerNumber, { color: tintColor }]}>
                      {surah.surah}
                    </ThemedText>
                    <View style={styles.surahPickerItemText}>
                      <ThemedText style={styles.surahPickerName}>{surah.name}</ThemedText>
                      <ThemedText style={[styles.surahPickerAyahCount, { color: mutedColor }]}>
                        {surah.ayahCount} ayahs
                      </ThemedText>
                    </View>
                  </View>
                  {selectedSurah === surah.surah && (
                    <Ionicons name="checkmark-circle" size={24} color={tintColor} />
                  )}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Ayah Picker Modal Component
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
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'mutedForeground');
  const tintColor = useThemeColor({}, 'tint');
  const surahInfo = quranRangeService.getSurahInfo(surah);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.pickerModalContent, { backgroundColor: cardColor }]}>
          <View style={[styles.pickerHeader, { borderBottomColor: borderColor }]}>
            <View>
              <ThemedText style={styles.pickerHeaderTitle}>Select Ayah</ThemedText>
              {surahInfo && (
                <ThemedText style={[styles.pickerHeaderSubtitle, { color: mutedColor }]}>
                  {surahInfo.name} ({surah})
                </ThemedText>
              )}
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </Pressable>
          </View>
          <ScrollView 
            style={styles.pickerScrollView} 
            contentContainerStyle={styles.ayahPickerGrid}
            showsVerticalScrollIndicator={true}
          >
            {ayahs.map((ayah) => (
              <Pressable
                key={ayah}
                onPress={() => onSelect(ayah)}
                style={[
                  styles.ayahPickerItem,
                  {
                    backgroundColor: selectedAyah === ayah ? tintColor : 'transparent',
                    borderColor: selectedAyah === ayah ? tintColor : borderColor,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.ayahPickerItemText,
                    { color: selectedAyah === ayah ? '#fff' : textColor },
                  ]}
                >
                  {ayah}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '70%',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modeSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  rangeSection: {
    marginBottom: 12,
  },
  rangeSectionCompact: {
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionTitleCompact: {
    marginBottom: 1,
  },
  inputRow: {
    marginBottom: 16,
  },
  fromToRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  fromToRowCompact: {
    marginBottom: 8,
  },
  fromToField: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    marginBottom: 8,
  },
  numberInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    textAlign: 'center',
  },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    minHeight: 44,
  },
  pickerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pickerButtonTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  pickerButtonNumber: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  pickerButtonName: {
    fontSize: 12,
  },
  pickerModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '60%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  pickerHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerHeaderSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  pickerScrollView: {
    flex: 1,
  },
  surahPickerItem: {
    borderLeftWidth: 4,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
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
    fontSize: 18,
    fontWeight: '700',
    width: 40,
    textAlign: 'center',
  },
  surahPickerItemText: {
    flex: 1,
    marginLeft: 12,
  },
  surahPickerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  surahPickerAyahCount: {
    fontSize: 12,
  },
  ayahPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
    justifyContent: 'flex-start',
  },
  ayahPickerItem: {
    width: '18%',
    minWidth: 60,
    maxWidth: 80,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahPickerItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  surahPicker: {
    maxHeight: 200,
  },
  surahButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  surahButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  surahName: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  ayahDisplay: {
    fontSize: 12,
    marginTop: 4,
  },
  summary: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});

