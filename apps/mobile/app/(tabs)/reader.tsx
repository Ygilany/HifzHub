import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  I18nManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { QuranPage } from '@/components/quran';
import { quranService, TOTAL_PAGES } from '@/lib/quran';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Page dimensions
const PAGE_WIDTH = SCREEN_WIDTH;
const PAGE_HEIGHT = SCREEN_HEIGHT;

// Cream/parchment background color for consistency
const PAGE_BACKGROUND = '#FFFEF5';

// Layout heights for padding calculations
const HEADER_CONTENT_HEIGHT = 44; // Just the navigation row
const TAB_BAR_HEIGHT = 85; // Native tab bar height

export default function ReaderScreen() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // Initialize the Quran service
  useEffect(() => {
    async function init() {
      try {
        await quranService.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Quran service:', error);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Generate page data for FlatList
  const pages = React.useMemo(() => {
    return Array.from({ length: TOTAL_PAGES }, (_, i) => i);
  }, []);

  // Handle page change from scrolling
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newPage = viewableItems[0].item + 1;
      setCurrentPage(newPage);
      setPageInput(newPage.toString());
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Fixed padding for content to avoid header/footer overlap
  // Header: insets.top + 8 (paddingTop) + HEADER_CONTENT_HEIGHT + 12 (paddingBottom) + margin
  const headerPadding = insets.top + 8 + HEADER_CONTENT_HEIGHT + 12 + 16;
  const footerPadding = TAB_BAR_HEIGHT + 30; // Tab bar + page number space

  // Render a single page
  const renderPage = useCallback(({ item: pageIndex }: { item: number }) => {
    return (
      <View style={[styles.pageWrapper, { width: PAGE_WIDTH, height: PAGE_HEIGHT }]}>
        <QuranPage
          pageIndex={pageIndex}
          pageWidth={PAGE_WIDTH}
          pageHeight={PAGE_HEIGHT}
          topPadding={headerPadding}
          bottomPadding={footerPadding}
        />
      </View>
    );
  }, [headerPadding, footerPadding]);

  // Navigate to a specific page
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= TOTAL_PAGES) {
      flatListRef.current?.scrollToIndex({
        index: page - 1,
        animated: true,
      });
      setCurrentPage(page);
      setPageInput(page.toString());
    }
  }, []);

  // Handle page input change
  const handlePageInputSubmit = useCallback(() => {
    const page = parseInt(pageInput, 10);
    if (!isNaN(page)) {
      goToPage(page);
    }
  }, [pageInput, goToPage]);

  // Get item layout for better scroll performance
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: PAGE_WIDTH,
    offset: PAGE_WIDTH * index,
    index,
  }), []);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>
          Loading Quran...
        </Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>
          Failed to load Quran data
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Quran Pages */}
      <View style={styles.pagesContainer}>
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
          removeClippedSubviews={true}
          // RTL reading direction - start from the end (page 1 on the right)
          inverted={!I18nManager.isRTL}
          initialScrollIndex={0}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: false,
              });
            }, 100);
          }}
        />
      </View>

      {/* Header Controls - Always visible */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.pageNavigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={currentPage <= 1 ? '#999' : '#333'}
            />
          </TouchableOpacity>

          <View style={styles.pageInputContainer}>
            <TextInput
              style={styles.pageInput}
              value={pageInput}
              onChangeText={setPageInput}
              onSubmitEditing={handlePageInputSubmit}
              keyboardType="number-pad"
              returnKeyType="go"
              maxLength={3}
            />
            <Text style={styles.pageTotal}>/ {TOTAL_PAGES}</Text>
          </View>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => goToPage(currentPage + 1)}
            disabled={currentPage >= TOTAL_PAGES}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={currentPage >= TOTAL_PAGES ? '#999' : '#333'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Page Number - Small, bottom right corner */}
      <View style={[styles.pageNumberCorner, { bottom: TAB_BAR_HEIGHT + 8, right: 16 }]}>
        <Text style={styles.pageNumberText}>
          {convertToArabicNumerals(currentPage)}
        </Text>
      </View>
    </View>
  );
}

// Helper function to convert numbers to Arabic-Indic numerals
function convertToArabicNumerals(num: number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(digit => arabicNumerals[parseInt(digit, 10)]).join('');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAGE_BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: PAGE_BACKGROUND,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: PAGE_BACKGROUND,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  pagesContainer: {
    flex: 1,
  },
  pageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PAGE_BACKGROUND,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255, 254, 245, 0.95)',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  pageNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  navButton: {
    padding: 8,
  },
  pageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pageInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    color: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'center',
  },
  pageTotal: {
    color: '#666',
    fontSize: 14,
  },
  pageNumberCorner: {
    position: 'absolute',
    zIndex: 10,
  },
  pageNumberText: {
    color: '#8B7355',
    fontSize: 14,
    fontWeight: '500',
  },
});

