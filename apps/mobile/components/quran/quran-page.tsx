/**
 * QuranPage - Quran page rendering component
 * 
 * Uses Skia for proper justification in development builds,
 * falls back to native Text rendering in Expo Go.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, ScrollView } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useFonts } from 'expo-font';
import { quranService } from '@/lib/quran';
import { NativeQuranLine } from './native-quran-line';

// Font asset
const DIGITAL_KHATT_FONT = require('@/assets/quran/DigitalKhattV2.otf');

// Check if we're in Expo Go (where Skia native code isn't available)
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Layout constants
const MARGIN_RATIO = 0.02;
const HORIZONTAL_PADDING = 4;

interface QuranPageProps {
  pageIndex: number;
  pageWidth: number;
  pageHeight: number;
  topPadding?: number;
  bottomPadding?: number;
}

/**
 * Native Text-based QuranPage for Expo Go
 */
function NativeQuranPage({
  pageIndex,
  pageWidth,
  pageHeight,
  topPadding = 0,
  bottomPadding = 0,
}: QuranPageProps) {
  const [fontsLoaded] = useFonts({
    'DigitalKhatt': DIGITAL_KHATT_FONT,
  });

  const contentWidth = pageWidth - (HORIZONTAL_PADDING * 2);

  const pageData = useMemo(() => {
    const baseFontSize = contentWidth / 15;
    const fontSize = Math.round(baseFontSize);
    const lineHeight = Math.round(fontSize * 1.65);

    return {
      fontSize,
      lineHeight,
    };
  }, [contentWidth]);

  const pageText = quranService.getPageText(pageIndex);

  if (!fontsLoaded) {
    return (
      <View style={[styles.pageContainer, { width: pageWidth, height: pageHeight }]}>
        <ActivityIndicator size="large" color="#1a5f4a" />
        <Text style={styles.loadingText}>Loading font...</Text>
      </View>
    );
  }

  if (!pageText || pageText.length === 0) {
    return (
      <View style={[styles.pageContainer, { width: pageWidth, height: pageHeight }]}>
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
          
          // Use isCentered from the database
          const isCentered = lineInfo.isCentered;
          const isSurahName = lineInfo.lineType === 1;
          const isBasmallah = lineInfo.lineType === 2;
          
          return (
            <NativeQuranLine
              key={lineIndex}
              lineText={line}
              fontSize={pageData.fontSize}
              lineHeight={pageData.lineHeight}
              contentWidth={contentWidth}
              isCentered={isCentered}
              isSurahName={isSurahName}
              isBasmallah={isBasmallah}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

/**
 * Skia-based QuranPage for development builds
 * Only loaded when not in Expo Go
 */
let SkiaQuranPage: React.ComponentType<QuranPageProps> | null = null;

if (!isExpoGo) {
  // Dynamically import Skia components only when not in Expo Go
  const { Canvas, useFonts: useSkiaFonts, Skia, TextDirection, TextHeightBehavior } = require('@shopify/react-native-skia');
  const { JustService, SPACEWIDTH, SpaceType, analyzeText } = require('@/lib/quran/just-service');

  const lineParStyle = {
    textHeightBehavior: TextHeightBehavior.DisableAll,
    textDirection: TextDirection.RTL,
  };

  SkiaQuranPage = function SkiaQuranPageComponent({
    pageIndex,
    pageWidth,
    pageHeight,
    topPadding = 0,
    bottomPadding = 0,
  }: QuranPageProps) {
    const fontMgr = useSkiaFonts({
      DigitalKhatt: [DIGITAL_KHATT_FONT],
    });

    const layout = useMemo(() => {
      const margin = pageWidth * MARGIN_RATIO;
      const lineWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - topPadding - bottomPadding;
      const pageText = quranService.getPageText(pageIndex);
      const numLines = pageText?.length || 15;
      const baseFontSize = lineWidth / 14;
      const interline = contentHeight / numLines;

      return {
        margin,
        lineWidth,
        fontSize: baseFontSize,
        interline,
        top: topPadding,
        contentHeight,
      };
    }, [pageWidth, pageHeight, topPadding, bottomPadding, pageIndex]);

    const pageText = quranService.getPageText(pageIndex);

    if (!fontMgr) {
      return (
        <View style={[styles.pageContainer, { width: pageWidth, height: pageHeight }]}>
          <ActivityIndicator size="large" color="#1a5f4a" />
          <Text style={styles.loadingText}>Loading font...</Text>
        </View>
      );
    }

    if (!pageText || pageText.length === 0) {
      return (
        <View style={[styles.pageContainer, { width: pageWidth, height: pageHeight }]}>
          <Text style={styles.loadingText}>No content for page {pageIndex + 1}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.container, { width: pageWidth, height: pageHeight }]}>
        <Canvas style={styles.canvas}>
          {pageText.map((lineText, lineIndex) => {
            const lineInfo = quranService.getLineInfo(pageIndex, lineIndex);
            const yPos = layout.top + (lineIndex + 0.8) * layout.interline;
            const fontSizeLineWidthRatio = layout.fontSize / layout.lineWidth;
            const lineTextInfo = analyzeText(lineText);
            
            // Calculate justification
            let justResult;
            if (lineInfo.lineType === 1 || lineInfo.lineType === 2) {
              justResult = {
                fontFeatures: new Map(),
                simpleSpacing: SPACEWIDTH,
                ayaSpacing: SPACEWIDTH,
                fontSizeRatio: 1,
              };
            } else {
              const justService = new JustService(
                lineTextInfo,
                fontMgr,
                fontSizeLineWidthRatio,
                lineInfo.lineWidthRatio ?? 1,
                lineText
              );
              justResult = justService.justifyLine();
              justService.dispose();
            }

            // Build paragraph
            const scale = (layout.fontSize * justResult.fontSizeRatio) / 1000;
            const textStyle = {
              color: Skia.Color('black'),
              fontFamilies: ['DigitalKhatt'],
              fontSize: justResult.fontSizeRatio * layout.fontSize,
            };

            if (lineInfo.lineType === 2) {
              textStyle.fontFeatures = [{ name: 'basm', value: 1 }];
            }

            let paragraphBuilder = Skia.ParagraphBuilder.Make(lineParStyle, fontMgr);
            paragraphBuilder.pushStyle(textStyle);

            for (let wordIndex = 0; wordIndex < lineTextInfo.wordInfos.length; wordIndex++) {
              const wordInfo = lineTextInfo.wordInfos[wordIndex];

              for (let i = wordInfo.startIndex; i <= wordInfo.endIndex; i++) {
                const char = lineText.charAt(i);
                const justInfo = justResult.fontFeatures.get(i);

                if (justInfo) {
                  const newtextStyle = { ...textStyle, fontFeatures: justInfo };
                  paragraphBuilder.pushStyle(newtextStyle);
                  paragraphBuilder.addText(char);
                  paragraphBuilder.pop();
                } else {
                  paragraphBuilder.addText(char);
                }
              }

              const spaceType = lineTextInfo.spaces.get(wordInfo.endIndex + 1);
              if (spaceType !== undefined) {
                const newtextStyle = { ...textStyle };
                if (spaceType === SpaceType.Aya) {
                  newtextStyle.letterSpacing = (justResult.ayaSpacing - SPACEWIDTH) * scale;
                } else if (spaceType === SpaceType.Simple) {
                  newtextStyle.letterSpacing = (justResult.simpleSpacing - SPACEWIDTH) * scale;
                }
                paragraphBuilder.pushStyle(newtextStyle);
                paragraphBuilder.addText(' ');
                paragraphBuilder.pop();
              }
            }

            const maxWidth = pageWidth * 2;
            paragraphBuilder.pop();
            const paragraph = paragraphBuilder.build();
            paragraph.layout(maxWidth);

            const currLineWidth = paragraph.getLongestLine();
            let effectiveMargin = layout.margin;

            if (lineInfo.lineType === 1 || lineInfo.lineType === 2 || lineInfo.isCentered) {
              effectiveMargin = (pageWidth - currLineWidth) / 2;
            }

            const xPos = -(maxWidth - pageWidth + effectiveMargin);
            paragraphBuilder.dispose();

            const { Paragraph } = require('@shopify/react-native-skia');
            return (
              <Paragraph
                key={`${pageIndex}-${lineIndex}`}
                paragraph={paragraph}
                x={xPos}
                y={yPos}
                width={maxWidth}
              />
            );
          })}
        </Canvas>
      </View>
    );
  };
}

// Log once about Expo Go fallback
let hasLoggedExpoGoMessage = false;

/**
 * Main QuranPage component - automatically selects the best renderer
 */
export function QuranPage(props: QuranPageProps) {
  if (isExpoGo || !SkiaQuranPage) {
    // In Expo Go, show a message once and use native rendering
    if (isExpoGo && !hasLoggedExpoGoMessage) {
      console.log('Running in Expo Go - using native Text rendering. For proper Mushaf justification, create a development build.');
      hasLoggedExpoGoMessage = true;
    }
    return <NativeQuranPage {...props} />;
  }
  
  return <SkiaQuranPage {...props} />;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFEF5',
  },
  canvas: {
    flex: 1,
  },
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
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default QuranPage;
