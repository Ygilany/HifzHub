import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  I18nManager,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  QuranBottomDock,
  QuranPage,
  QuranTopPill,
  SummarySheet,
  tallyMarkings,
} from '@/components/quran';
import type { WordMarkingType } from '@/components/quran/quran-page';
import { quranService, TOTAL_PAGES } from '@/lib/quran';
import { api } from '@/lib/trpc/client';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PAGE_WIDTH = SCREEN_WIDTH;
const PAGE_HEIGHT = SCREEN_HEIGHT;

const PAGE_BACKGROUND = '#FFFEF5';
const TAB_BAR_HEIGHT = 85;

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

function toArabicNumerals(num: number): string {
  return num
    .toString()
    .split('')
    .map((d) => ARABIC_DIGITS[parseInt(d, 10)])
    .join('');
}

export default function ReaderScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  // Student context — present only when teacher opens reader for a specific student
  const { studentId, studentName } = useLocalSearchParams<{
    studentId?: string;
    studentName?: string;
  }>();
  const inStudentMode = !!studentId;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // word key → marking type
  const [wordMarkings, setWordMarkings] = useState<Map<string, WordMarkingType>>(new Map());
  // word key → arabic word text (captured when a word is first tapped)
  const [wordTexts, setWordTexts] = useState<Map<string, string>>(new Map());

  const [chromeVisible, setChromeVisible] = useState(true);
  const [summaryVisible, setSummaryVisible] = useState(false);

  // ── Quran service init ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    quranService
      .initialize()
      .then(() => { if (!cancelled) setIsInitialized(true); })
      .catch((err) => console.error('Failed to initialize Quran service:', err))
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // ── Load existing mistakes when opening for a student ────────────────────
  const { data: existingMistakes, isLoading: mistakesLoading } =
    api.students.getWordMistakes.useQuery(
      { studentId: studentId! },
      { enabled: inStudentMode },
    );

  useEffect(() => {
    if (!existingMistakes?.mistakes?.length) return;
    const marks = new Map<string, WordMarkingType>();
    const texts = new Map<string, string>();
    for (const m of existingMistakes.mistakes) {
      const key = `${m.pageIndex}-${m.lineIndex}-${m.wordIndex}`;
      marks.set(key, m.mistakeType as WordMarkingType);
      texts.set(key, m.wordText);
    }
    setWordMarkings(marks);
    setWordTexts(texts);
  }, [existingMistakes]);

  // ── Save mistakes ─────────────────────────────────────────────────────────
  const recordMistakes = api.sessions.recordWordMistakes.useMutation({
    onSuccess: (data) => {
      setSummaryVisible(false);
      Alert.alert(
        'Session saved',
        `${data.saved} mistake${data.saved !== 1 ? 's' : ''} recorded for ${studentName ?? 'student'}.`,
      );
    },
    onError: (err) => {
      Alert.alert('Could not save', err.message);
    },
  });

  const handleSave = useCallback(() => {
    if (!studentId) return;
    const mistakes: Array<{
      pageIndex: number;
      lineIndex: number;
      wordIndex: number;
      wordText: string;
      mistakeType: 'memory' | 'tashkeel' | 'tajweed' | 'corrected';
    }> = [];

    for (const [key, type] of wordMarkings) {
      const parts = key.split('-').map(Number);
      if (parts.length !== 3) continue;
      const [pageIndex, lineIndex, wordIndex] = parts as [number, number, number];
      mistakes.push({
        pageIndex,
        lineIndex,
        wordIndex,
        wordText: wordTexts.get(key) ?? '',
        mistakeType: type as 'memory' | 'tashkeel' | 'tajweed' | 'corrected',
      });
    }

    recordMistakes.mutate({ studentId, mistakes });
  }, [studentId, wordMarkings, wordTexts, recordMistakes]);

  // ── Derived counts ────────────────────────────────────────────────────────
  const pages = useMemo(() => Array.from({ length: TOTAL_PAGES }, (_, i) => i), []);
  const counts = useMemo(() => tallyMarkings(wordMarkings), [wordMarkings]);
  const totalMarks = counts.memory + counts.tashkeel + counts.tajweed;

  const headerPadding = insets.top + 52;
  const footerPadding = TAB_BAR_HEIGHT + 76;

  // ── Marking callback ──────────────────────────────────────────────────────
  const onWordMarkingChange = useCallback(
    (wordKey: string, marking: WordMarkingType | null, wordText?: string) => {
      setWordMarkings((prev) => {
        const next = new Map(prev);
        if (marking === null) next.delete(wordKey);
        else next.set(wordKey, marking);
        return next;
      });
      if (wordText !== undefined) {
        setWordTexts((prev) => {
          const next = new Map(prev);
          if (marking === null) next.delete(wordKey);
          else next.set(wordKey, wordText);
          return next;
        });
      }
    },
    [],
  );

  // ── FlatList helpers ──────────────────────────────────────────────────────
  const renderPage = useCallback(
    ({ item: pageIndex }: { item: number }) => (
      <View style={[styles.pageWrapper, { width: PAGE_WIDTH, height: PAGE_HEIGHT }]}>
        <QuranPage
          pageIndex={pageIndex}
          pageWidth={PAGE_WIDTH}
          pageHeight={PAGE_HEIGHT}
          topPadding={headerPadding}
          bottomPadding={footerPadding}
          interactionMode={inStudentMode ? 'marking' : 'none'}
          wordMarkings={wordMarkings}
          onWordMarkingChange={inStudentMode ? onWordMarkingChange : undefined}
        />
      </View>
    ),
    [headerPadding, footerPadding, inStudentMode, wordMarkings, onWordMarkingChange],
  );

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= TOTAL_PAGES) {
      flatListRef.current?.scrollToIndex({ index: page - 1, animated: true });
      setCurrentPage(page);
    }
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setCurrentPage(viewableItems[0].item + 1);
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const getItemLayout = useCallback(
    (_: any, index: number) => ({ length: PAGE_WIDTH, offset: PAGE_WIDTH * index, index }),
    [],
  );

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/(home)');
  }, []);

  const handleToggleChrome = useCallback(() => {
    if (inStudentMode) setChromeVisible((v) => !v);
  }, [inStudentMode]);

  // ── Loading / error states ────────────────────────────────────────────────
  if (isLoading || (inStudentMode && mistakesLoading)) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Loading Quran…</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>Failed to load Quran data</Text>
      </View>
    );
  }

  const pageInfo = `Page ${toArabicNumerals(currentPage)} · ${currentPage} / ${TOTAL_PAGES}`;
  const displayName = studentName ?? 'Reader';

  return (
    <View style={styles.container}>
      <Pressable style={styles.pagesContainer} onPress={handleToggleChrome}>
        <FlatList
          ref={flatListRef}
          data={pages}
          renderItem={renderPage}
          keyExtractor={(item) => item.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={getItemLayout}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews
          inverted={!I18nManager.isRTL}
          initialScrollIndex={0}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
            }, 100);
          }}
        />
      </Pressable>

      {inStudentMode && (
        <>
          <QuranTopPill
            visible={chromeVisible}
            studentName={displayName}
            pageInfo={pageInfo}
            totalMarks={totalMarks}
            onBack={handleBackPress}
            onReview={() => setSummaryVisible(true)}
            top={insets.top + 6}
          />

          <QuranBottomDock
            visible={chromeVisible}
            counts={counts}
            canPrev={currentPage > 1}
            canNext={currentPage < TOTAL_PAGES}
            onPrev={() => goToPage(currentPage - 1)}
            onNext={() => goToPage(currentPage + 1)}
            bottom={TAB_BAR_HEIGHT + 12}
          />

          <SummarySheet
            visible={summaryVisible}
            studentName={displayName}
            pageInfo={pageInfo}
            counts={counts}
            onClose={() => setSummaryVisible(false)}
            canSave
            onSave={handleSave}
            isSaving={recordMistakes.isPending}
          />
        </>
      )}

      {!inStudentMode && (
        // Minimal back button for browse mode
        <Pressable
          style={[styles.backBtn, { top: insets.top + 8 }]}
          onPress={handleBackPress}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color="#3a2a15" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAGE_BACKGROUND },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16,
    backgroundColor: PAGE_BACKGROUND,
  },
  loadingText: { fontSize: 16, fontWeight: '500', color: '#666' },
  errorContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16,
    backgroundColor: PAGE_BACKGROUND,
  },
  errorText: { fontSize: 16, fontWeight: '500', color: '#666' },
  pagesContainer: { flex: 1 },
  pageWrapper: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: PAGE_BACKGROUND,
  },
  backBtn: {
    position: 'absolute',
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,249,232,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
