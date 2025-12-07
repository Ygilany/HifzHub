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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { QuranPage } from '@/components/quran';
import { quranService, TOTAL_PAGES } from '@/lib/quran';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Page width with some padding
const PAGE_WIDTH = SCREEN_WIDTH;
const PAGE_HEIGHT = SCREEN_HEIGHT;

export default function ReaderScreen() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [pageInput, setPageInput] = useState('1');
  
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

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

  // Render a single page
  const renderPage = useCallback(({ item: pageIndex }: { item: number }) => {
    return (
      <View style={[styles.pageWrapper, { width: PAGE_WIDTH }]}>
        <QuranPage
          pageIndex={pageIndex}
          pageWidth={PAGE_WIDTH - 16} // Small padding on sides
        />
      </View>
    );
  }, []);

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

  // Toggle controls visibility
  const toggleControls = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);

  // Get item layout for better scroll performance
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: PAGE_WIDTH,
    offset: PAGE_WIDTH * index,
    index,
  }), []);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={[styles.loadingText, { color: textColor }]}>
          Loading Quran...
        </Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={[styles.errorContainer, { backgroundColor }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <Text style={[styles.errorText, { color: textColor }]}>
          Failed to load Quran data
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#1A1A1A' }]} edges={['top']}>
      {/* Header Controls */}
      {showControls && (
        <View style={[styles.header, { paddingTop: 8 }]}>
          <View style={styles.pageNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={currentPage <= 1 ? '#666' : '#FFF'}
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
                color={currentPage >= TOTAL_PAGES ? '#666' : '#FFF'}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Quran Pages */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={toggleControls}
        style={styles.pagesContainer}
      >
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
      </TouchableOpacity>

      {/* Bottom Page Indicator */}
      {showControls && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.pageIndicator}>
            <Text style={styles.pageIndicatorText}>
              صفحة {convertToArabicNumerals(currentPage)}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'center',
  },
  pageTotal: {
    color: '#AAA',
    fontSize: 14,
  },
  pagesContainer: {
    flex: 1,
  },
  pageWrapper: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: 'center',
  },
  pageIndicator: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  pageIndicatorText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
});

