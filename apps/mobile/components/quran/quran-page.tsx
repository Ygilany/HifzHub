import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import { quranService } from '@/lib/quran';

// Font asset - DigitalKhatt is a variable font that supports letter width adjustment
const DIGITAL_KHATT_FONT = require('@/assets/quran/DigitalKhattV2.otf');

// Minimal horizontal padding to maximize text width
const HORIZONTAL_PADDING = 4;

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

  // Calculate content width for line sizing
  const contentWidth = pageWidth - (HORIZONTAL_PADDING * 2);

  const pageData = useMemo(() => {
    // Calculate font size based on content width
    // DigitalKhatt font is designed for Mushaf layouts
    const baseFontSize = contentWidth / 15;
    const fontSize = customFontSize ?? Math.round(baseFontSize);
    const lineHeight = Math.round(fontSize * 1.65);

    return {
      fontSize,
      lineHeight,
    };
  }, [contentWidth, customFontSize]);

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
          const lineInfo = quranService.getLineInfo(pageIndex, lineIndex);
          
          // Use isCentered from the database (set for surah names, basmallah, and special pages)
          const isCentered = lineInfo.isCentered;
          const isSurahName = lineInfo.lineType === 1;
          const isBasmallah = lineInfo.lineType === 2;
          
          return (
            <View 
              key={lineIndex} 
              style={[styles.lineContainer, { width: contentWidth }]}
            >
              <Text
                style={[
                  styles.arabicText,
                  {
                    fontSize: pageData.fontSize,
                    lineHeight: pageData.lineHeight,
                    width: contentWidth,
                  },
                  // Use is_centered from database for text alignment
                  isCentered ? styles.centeredLine : styles.justifiedLine,
                  isSurahName && styles.surahName,
                  isBasmallah && styles.basmallah,
                ]}
                // For non-centered lines, use adjustsFontSizeToFit to help fit text
                // This works with DigitalKhatt's variable width capabilities
                adjustsFontSizeToFit={!isCentered}
                minimumFontScale={0.7}
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
  },
  pageContainer: {
    flex: 1,
    backgroundColor: '#FFFEF5',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lineContainer: {
    alignItems: 'stretch',
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
    writingDirection: 'rtl',
  },
  justifiedLine: {
    // Right-aligned for RTL text (which is the start of the line)
    // The text will fill the width through adjustsFontSizeToFit
    textAlign: 'right',
  },
  centeredLine: {
    textAlign: 'center',
  },
  surahName: {
    color: '#1a5f4a', // Dark green for surah names
    marginVertical: 4,
  },
  basmallah: {
    color: '#1a1a1a',
    marginVertical: 4,
  },
});

export default QuranPage;
