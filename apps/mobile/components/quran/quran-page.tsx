import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import { quranService } from '@/lib/quran';

// Font asset
const DIGITAL_KHATT_FONT = require('@/assets/quran/DigitalKhattV2.otf');

// Minimal horizontal padding to maximize text width
const HORIZONTAL_PADDING = 6;

interface QuranPageProps {
  pageIndex: number;
  pageWidth: number;
  fontSize?: number;
  topPadding?: number;
  bottomPadding?: number;
}

export function QuranPage({ 
  pageIndex, 
  pageWidth, 
  fontSize: customFontSize,
  topPadding = 80,
  bottomPadding = 80,
}: QuranPageProps) {
  // Load font using expo-font
  const [fontsLoaded] = useFonts({
    'DigitalKhatt': DIGITAL_KHATT_FONT,
  });

  const pageData = useMemo(() => {
    // Calculate font size based on page width
    // The DigitalKhatt font needs proper sizing to fit all words on each line
    // Start smaller to ensure all text fits, then let adjustsFontSizeToFit handle optimization
    const baseFontSize = pageWidth / 15; // Smaller base to ensure text fits
    const fontSize = customFontSize ?? Math.round(baseFontSize);
    const lineHeight = Math.round(fontSize * 1.6);

    return {
      fontSize,
      lineHeight,
    };
  }, [pageWidth, customFontSize]);

  const pageText = quranService.getPageText(pageIndex);

  if (!fontsLoaded) {
    return (
      <View style={[styles.pageContainer, { width: pageWidth }]}>
        <Text style={styles.loadingText}>Loading font...</Text>
      </View>
    );
  }

  if (!pageText || pageText.length === 0) {
    return (
      <View style={[styles.pageContainer, { width: pageWidth }]}>
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
    <ScrollView 
      style={[styles.scrollContainer, { width: pageWidth }]}
      contentContainerStyle={[
        styles.scrollContent, 
        { paddingTop: topPadding, paddingBottom: bottomPadding }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.contentContainer, { paddingHorizontal: HORIZONTAL_PADDING }]}>
        {pageText.map((line, lineIndex) => {
          const lineStyle = getLineStyle(lineIndex);
          const lineInfo = quranService.getLineInfo(pageIndex, lineIndex);
          
          // For regular ayah lines, use adjustsFontSizeToFit to fill the width
          const isSpecialLine = lineInfo.lineType === 1 || lineInfo.lineType === 2;
          
          return (
            <View key={lineIndex} style={styles.lineContainer}>
              <Text
                style={[
                  styles.arabicText,
                  lineStyle,
                  isSpecialLine && styles.centeredLine,
                  lineInfo.lineType === 1 && styles.surahName,
                  lineInfo.lineType === 2 && styles.basmallah,
                ]}
                adjustsFontSizeToFit={!isSpecialLine}
                minimumFontScale={0.5}
                numberOfLines={1}
              >
                {line}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFFEF5',
  },
  scrollContent: {
    flexGrow: 1,
    // Padding is now applied dynamically via props
  },
  pageContainer: {
    flex: 1,
    backgroundColor: '#FFFEF5',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  lineContainer: {
    width: '100%',
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
  },
  centeredLine: {
    textAlign: 'center',
  },
  surahName: {
    color: '#1a5f4a', // Dark green for surah names
    fontWeight: '600',
    marginVertical: 4,
  },
  basmallah: {
    color: '#1a1a1a',
    marginVertical: 4,
  },
});

export default QuranPage;
