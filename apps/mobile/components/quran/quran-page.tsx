/**
 * QuranPage - Quran page rendering component
 * 
 * Based on the mushaf-react-native reference implementation.
 * Uses Skia for proper justification in development builds,
 * falls back to native Text rendering in Expo Go.
 */

import { quranService } from '@/lib/quran';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useFonts } from 'expo-font';
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NativeQuranLine } from './native-quran-line';

// Font asset
const DIGITAL_KHATT_FONT = require('@/assets/quran/DigitalKhattV2.otf');

// Check if we're in Expo Go (where Skia native code isn't available)
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Reference coordinate system constants (matching mushaf-react-native)
const PAGE_WIDTH_REF = 17000;
const MARGIN_REF = 400;
const FONTSIZE_REF = 1000;
const INTERLINE_REF = 1800;
const SPACEWIDTH = 100;

// Horizontal padding for native rendering
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
  const contentHeight = pageHeight - topPadding - bottomPadding;
  const pageText = quranService.getPageText(pageIndex);
  const numLines = pageText?.length || 15;

  const pageData = useMemo(() => {
    const baseFontSize = contentWidth / 16;
    const fontSize = Math.round(baseFontSize);
    const lineHeight = contentHeight / numLines;

    return {
      fontSize,
      lineHeight,
    };
  }, [contentWidth, contentHeight, numLines]);

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
    <View style={[styles.pageContentContainer, { width: pageWidth, height: pageHeight }]}>
      <View 
        style={[
          styles.contentContainer, 
          { 
            paddingHorizontal: HORIZONTAL_PADDING,
            paddingTop: topPadding,
            paddingBottom: bottomPadding,
          }
        ]}
      >
        {pageText.map((line, lineIndex) => {
          const lineInfo = quranService.getLineInfo(pageIndex, lineIndex);
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
    </View>
  );
}

/**
 * Skia-based QuranPage for development builds
 * Only loaded when not in Expo Go
 */
let SkiaQuranPage: React.ComponentType<QuranPageProps> | null = null;

if (!isExpoGo) {
  // Dynamically import Skia components only when not in Expo Go
  const { Canvas, useFonts: useSkiaFonts, Skia, TextDirection, TextHeightBehavior, Paragraph } = require('@shopify/react-native-skia');
  const { JustService, SpaceType, analyzeText } = require('@/lib/quran/just-service');

  // Paragraph style for RTL text (no TextAlign - let RTL handle it)
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

    // Calculate layout based on reference coordinate system
    const layout = useMemo(() => {
      const scale = pageWidth / PAGE_WIDTH_REF;
      const margin = MARGIN_REF * scale;
      const lineWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - topPadding - bottomPadding;
      
      // Use FIXED interline based on reference constants (same for all pages)
      const interline = INTERLINE_REF * scale;
      
      // Calculate font size: scale the reference font size to match the page width
      const fontSize = FONTSIZE_REF * scale;
      
      // Font ascendant for positioning
      const ascendant = 400 * (fontSize / FONTSIZE_REF);

      return {
        scale,
        margin,
        lineWidth,
        fontSize,
        interline,
        ascendant,
        top: topPadding,
        contentHeight,
      };
    }, [pageWidth, pageHeight, topPadding, bottomPadding]);

    const pageText = quranService.getPageText(pageIndex);

    // Pre-compute all paragraphs
    const paragraphs = useMemo(() => {
      if (!fontMgr || !pageText || pageText.length === 0) {
        return null;
      }

      const fontSize = layout.fontSize;
      const fontSizeLineWidthRatio = fontSize / layout.lineWidth;
      const maxWidth = pageWidth * 2;

      // Starting y position - add topPadding to offset from the header
      let yPos = topPadding + (-layout.ascendant + (200 * layout.scale));

      return pageText.map((lineText, lineIndex) => {
        const lineInfo = quranService.getLineInfo(pageIndex, lineIndex);
        
        // Special positioning for first two pages
        if ((pageIndex === 0 || pageIndex === 1) && lineIndex === 1) {
          yPos = topPadding + (3 * layout.interline);
        }
        
        const currentYPos = yPos;
        yPos += layout.interline;

        const lineTextInfo = analyzeText(lineText);
        
        // Determine line width ratio and margin adjustment
        let lineWidthRatio = lineInfo.lineWidthRatio ?? 1;
        let effectiveMargin = layout.margin;
        
        if (lineWidthRatio !== 1) {
          const newLineWidth = layout.lineWidth * lineWidthRatio;
          effectiveMargin += (layout.lineWidth - newLineWidth) / 2;
        }

        // Calculate justification
        let justResult;
        if (lineInfo.lineType === 1 || (lineInfo.lineType === 2 && pageIndex !== 0 && pageIndex !== 1)) {
          // Surah name or basmallah (except on first two pages)
          justResult = {
            fontFeatures: new Map(),
            simpleSpacing: SPACEWIDTH,
            ayaSpacing: SPACEWIDTH,
            fontSizeRatio: 1,
          };
        } else {
          // Normal ayah line - apply justification
          const justService = new JustService(
            lineTextInfo,
            fontMgr,
            fontSizeLineWidthRatio,
            lineWidthRatio,
            lineText
          );
          justResult = justService.justifyLine();
        }

        // Build paragraph with the justified result
        const scale = (fontSize * justResult.fontSizeRatio) / FONTSIZE_REF;
        
        const textStyle: Record<string, any> = {
          color: Skia.Color('black'),
          fontFamilies: ['DigitalKhatt'],
          fontSize: justResult.fontSizeRatio * fontSize,
        };

        // Special font feature for basmallah (except on first two pages)
        if (lineInfo.lineType === 2 && pageIndex !== 0 && pageIndex !== 1) {
          textStyle.fontFeatures = [{ name: 'basm', value: 1 }];
        }

        const paragraphBuilder = Skia.ParagraphBuilder.Make(lineParStyle, fontMgr);
        paragraphBuilder.pushStyle(textStyle);

        // Build text with font features and spacing
        for (let wordIndex = 0; wordIndex < lineTextInfo.wordInfos.length; wordIndex++) {
          const wordInfo = lineTextInfo.wordInfos[wordIndex];
          if (!wordInfo) continue;

          // Add each character with its font features
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

          // Add space with appropriate spacing
          const spaceType = lineTextInfo.spaces.get(wordInfo.endIndex + 1);
          if (spaceType !== undefined) {
            const spaceStyle = { ...textStyle };
            if (spaceType === SpaceType.Aya) {
              spaceStyle.letterSpacing = (justResult.ayaSpacing - SPACEWIDTH) * scale;
            } else if (spaceType === SpaceType.Simple) {
              spaceStyle.letterSpacing = (justResult.simpleSpacing - SPACEWIDTH) * scale;
            }
            paragraphBuilder.pushStyle(spaceStyle);
            paragraphBuilder.addText(' ');
            paragraphBuilder.pop();
          }
        }

        paragraphBuilder.pop();
        const paragraph = paragraphBuilder.build();
        paragraph.layout(maxWidth);

        const currLineWidth = paragraph.getLongestLine();

        // Calculate x position
        let xPos: number;
        if (lineInfo.lineType === 1 || (lineInfo.lineType === 2 && pageIndex !== 0 && pageIndex !== 1)) {
          // Center surah names and basmallah
          const centerMargin = (pageWidth - currLineWidth) / 2;
          xPos = -(maxWidth - pageWidth + centerMargin);
        } else {
          // Regular lines: position with margin
          xPos = -(maxWidth - pageWidth + effectiveMargin);
        }

        return {
          paragraph,
          xPos,
          yPos: currentYPos,
          maxWidth,
        };
      });
    }, [fontMgr, pageText, pageIndex, layout, pageWidth, topPadding]);

    if (!fontMgr) {
      return (
        <View style={[styles.pageContainer, { width: pageWidth, height: pageHeight }]}>
          <ActivityIndicator size="large" color="#1a5f4a" />
          <Text style={styles.loadingText}>Loading font...</Text>
        </View>
      );
    }

    if (!pageText || pageText.length === 0 || !paragraphs) {
      return (
        <View style={[styles.pageContainer, { width: pageWidth, height: pageHeight }]}>
          <Text style={styles.loadingText}>No content for page {pageIndex + 1}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.container, { width: pageWidth, height: pageHeight }]}>
        <Canvas style={styles.canvas}>
          {paragraphs.map((item, lineIndex) => (
            <Paragraph
              key={`${pageIndex}-${lineIndex}`}
              paragraph={item.paragraph}
              x={item.xPos}
              y={item.yPos}
              width={item.maxWidth}
            />
          ))}
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
  pageContentContainer: {
    backgroundColor: '#FFFEF5',
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
