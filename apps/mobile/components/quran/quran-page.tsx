import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import { quranService, PAGE_WIDTH, INTERLINE, FONTSIZE, LINES_PER_PAGE } from '@/lib/quran';

// Font asset
const DIGITAL_KHATT_FONT = require('@/assets/quran/DigitalKhattV2.otf');

interface QuranPageProps {
  pageIndex: number;
  pageWidth: number;
  fontSize?: number;
}

export function QuranPage({ pageIndex, pageWidth, fontSize: customFontSize }: QuranPageProps) {
  // Load font using expo-font
  const [fontsLoaded] = useFonts({
    'DigitalKhatt': DIGITAL_KHATT_FONT,
  });

  const pageData = useMemo(() => {
    const scale = pageWidth / PAGE_WIDTH;
    const fontSize = customFontSize ?? Math.round(FONTSIZE * scale * 0.9);
    const lineHeight = Math.round(INTERLINE * scale);
    const pageHeight = LINES_PER_PAGE * lineHeight + 300 * scale;

    return {
      scale,
      fontSize,
      lineHeight,
      pageHeight,
    };
  }, [pageWidth, customFontSize]);

  const pageText = quranService.getPageText(pageIndex);

  if (!fontsLoaded) {
    return (
      <View style={[styles.pageContainer, { width: pageWidth, minHeight: pageData.pageHeight }]}>
        <Text style={styles.loadingText}>Loading font...</Text>
      </View>
    );
  }

  if (!pageText || pageText.length === 0) {
    return (
      <View style={[styles.pageContainer, { width: pageWidth, minHeight: pageData.pageHeight }]}>
        <Text style={styles.loadingText}>No content for page {pageIndex + 1}</Text>
      </View>
    );
  }

  // Get line info for special styling
  const getLineStyle = (lineIndex: number) => {
    const lineInfo = quranService.getLineInfo(pageIndex, lineIndex);
    const baseStyle = {
      fontSize: pageData.fontSize,
      lineHeight: pageData.lineHeight,
    };

    // Surah names and basmallah are centered
    if (lineInfo.lineType === 1 || lineInfo.lineType === 2) {
      return { ...baseStyle, textAlign: 'center' as const };
    }

    return baseStyle;
  };

  return (
    <View style={[styles.pageContainer, { width: pageWidth, minHeight: pageData.pageHeight }]}>
      <View style={styles.contentContainer}>
        {pageText.map((line, lineIndex) => {
          const lineStyle = getLineStyle(lineIndex);
          const lineInfo = quranService.getLineInfo(pageIndex, lineIndex);
          
          return (
            <Text
              key={lineIndex}
              style={[
                styles.arabicText,
                lineStyle,
                lineInfo.lineType === 1 && styles.surahName,
                lineInfo.lineType === 2 && styles.basmallah,
              ]}
            >
              {line}
            </Text>
          );
        })}
      </View>
      
      {/* Page number */}
      <View style={styles.pageNumberContainer}>
        <Text style={styles.pageNumber}>{pageIndex + 1}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    backgroundColor: '#FFFEF5', // Cream/parchment color
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  contentContainer: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
  arabicText: {
    fontFamily: 'DigitalKhatt',
    color: '#1a1a1a',
    textAlign: 'right',
    writingDirection: 'rtl',
    paddingVertical: 2,
  },
  surahName: {
    color: '#1a5f4a', // Dark green for surah names
    fontWeight: '600',
    marginVertical: 16,
  },
  basmallah: {
    color: '#1a1a1a',
    marginVertical: 12,
  },
  pageNumberContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0d5c0',
  },
  pageNumber: {
    fontSize: 14,
    color: '#8B7355',
    fontFamily: 'System',
  },
});

export default QuranPage;
