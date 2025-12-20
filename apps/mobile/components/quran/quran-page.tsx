/**
 * QuranPage - Quran page rendering component
 * 
 * Based on the mushaf-react-native reference implementation.
 * Uses Skia for proper justification in development builds,
 * falls back to native Text rendering in Expo Go.
 * 
 * Supports two interaction modes:
 * - 'tooltip': Shows a tooltip with Hifz/Tajweed options on tap
 * - 'marking': Cycles through marking states on tap (tajweed → tasheel → hifz → corrected → clear)
 */

import { quranService } from '@/lib/quran';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useFonts } from 'expo-font';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeQuranLine } from './native-quran-line';
import { WordTooltip } from './word-tooltip';

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

// Word interaction modes
export type WordInteractionMode = 'tooltip' | 'marking';

// Word marking types (cycle order: none → tajweed → tasheel → hifz → corrected → none)
export type WordMarkingType = 'tajweed' | 'tasheel' | 'hifz' | 'corrected';

// Marking configuration
export const MARKING_CONFIG: Record<WordMarkingType, { color: string; label: string }> = {
  tajweed: { color: 'rgba(255, 235, 59, 0.4)', label: 'Tajweed' },    // Yellow
  tasheel: { color: 'rgba(255, 152, 0, 0.4)', label: 'Tasheel' },     // Orange
  hifz: { color: 'rgba(244, 67, 54, 0.4)', label: 'Hifz' },           // Red
  corrected: { color: 'rgba(76, 175, 80, 0.4)', label: 'Corrected' }, // Green
};

// Order of marking cycle
const MARKING_CYCLE: (WordMarkingType | null)[] = [null, 'tajweed', 'tasheel', 'hifz', 'corrected'];

interface QuranPageProps {
  pageIndex: number;
  pageWidth: number;
  pageHeight: number;
  topPadding?: number;
  bottomPadding?: number;
  interactionMode?: WordInteractionMode;
  wordMarkings?: Map<string, WordMarkingType>;
  onWordMarkingChange?: (wordKey: string, marking: WordMarkingType | null) => void;
}

interface TooltipState {
  visible: boolean;
  position: { x: number; y: number; width: number };
  wordIndex: number;
  lineIndex: number;
  wordText: string;
}

interface WordRect {
  x: number;
  y: number;
  width: number;
  height: number;
  wordIndex: number;
  lineIndex: number;
  wordText: string;
}

// Helper to generate word key
function getWordKey(pageIndex: number, lineIndex: number, wordIndex: number): string {
  return `${pageIndex}-${lineIndex}-${wordIndex}`;
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
  const { Canvas, useFonts: useSkiaFonts, Skia, TextDirection, TextHeightBehavior, Paragraph, RoundedRect, Group } = require('@shopify/react-native-skia');
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
    interactionMode = 'marking', // Default to marking mode
    wordMarkings: externalWordMarkings,
    onWordMarkingChange,
  }: QuranPageProps) {
    const fontMgr = useSkiaFonts({
      DigitalKhatt: [DIGITAL_KHATT_FONT],
    });

    // Tooltip state (for tooltip mode)
    const [tooltip, setTooltip] = useState<TooltipState>({
      visible: false,
      position: { x: 0, y: 0, width: 0 },
      wordIndex: 0,
      lineIndex: 0,
      wordText: '',
    });

    // Internal word markings state (used if no external state provided)
    const [internalWordMarkings, setInternalWordMarkings] = useState<Map<string, WordMarkingType>>(new Map());
    
    // Use external markings if provided, otherwise use internal state
    const wordMarkings = externalWordMarkings ?? internalWordMarkings;
    const setWordMarking = useCallback((wordKey: string, marking: WordMarkingType | null) => {
      if (onWordMarkingChange) {
        onWordMarkingChange(wordKey, marking);
      } else {
        setInternalWordMarkings(prev => {
          const newMap = new Map(prev);
          if (marking === null) {
            newMap.delete(wordKey);
          } else {
            newMap.set(wordKey, marking);
          }
          return newMap;
        });
      }
    }, [onWordMarkingChange]);

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

    // Pre-compute all paragraphs and word rectangles
    const { paragraphs, wordRects } = useMemo(() => {
      if (!fontMgr || !pageText || pageText.length === 0) {
        return { paragraphs: null, wordRects: [] as WordRect[] };
      }

      const fontSize = layout.fontSize;
      const fontSizeLineWidthRatio = fontSize / layout.lineWidth;
      const maxWidth = pageWidth * 2;
      const allWordRects: WordRect[] = [];

      // Starting y position - add topPadding to offset from the header
      let yPos = topPadding + (-layout.ascendant + (200 * layout.scale));

      const paragraphData = pageText.map((lineText, lineIndex) => {
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

        // Calculate word rectangles for this line by measuring each word
        // For RTL text, we start from the right edge and work left
        const lineHeight = layout.interline;
        
        // Calculate where the text starts on screen (right edge for RTL)
        const lineRightEdge = pageWidth - effectiveMargin;
        
        // Measure each word and calculate positions
        let currentX = lineRightEdge; // Start from right for RTL
        
        for (let wi = 0; wi < lineTextInfo.wordInfos.length; wi++) {
          const wordInfo = lineTextInfo.wordInfos[wi];
          if (!wordInfo) continue;
          
          // Measure this word's width
          const wordBuilder = Skia.ParagraphBuilder.Make(lineParStyle, fontMgr);
          wordBuilder.pushStyle(textStyle);
          wordBuilder.addText(wordInfo.text);
          wordBuilder.pop();
          const wordPara = wordBuilder.build();
          wordPara.layout(maxWidth);
          const wordWidth = wordPara.getLongestLine();
          wordPara.dispose();
          
          // Calculate word position (RTL: subtract width from current position)
          const wordX = currentX - wordWidth;
          
          allWordRects.push({
            x: wordX,
            y: currentYPos,
            width: wordWidth,
            height: lineHeight,
            wordIndex: wi,
            lineIndex,
            wordText: wordInfo.text,
          });
          
          // Move left for next word (add space width)
          const spaceType = lineTextInfo.spaces.get(wordInfo.endIndex + 1);
          const spaceWidth = spaceType !== undefined 
            ? (spaceType === SpaceType.Aya ? justResult.ayaSpacing : justResult.simpleSpacing) * scale
            : 0;
          currentX = wordX - spaceWidth;
        }

        return {
          paragraph,
          xPos,
          yPos: currentYPos,
          maxWidth,
        };
      });

      return { paragraphs: paragraphData, wordRects: allWordRects };
    }, [fontMgr, pageText, pageIndex, layout, pageWidth, topPadding]);

    // Handle tap on canvas
    const handlePress = useCallback((event: { nativeEvent: { locationX: number; locationY: number } }) => {
      const { locationX, locationY } = event.nativeEvent;
      
      // Find the word at this position
      for (const rect of wordRects) {
        if (
          locationX >= rect.x &&
          locationX <= rect.x + rect.width &&
          locationY >= rect.y &&
          locationY <= rect.y + rect.height
        ) {
          const wordKey = getWordKey(pageIndex, rect.lineIndex, rect.wordIndex);
          
          if (interactionMode === 'marking') {
            // Marking mode: cycle through marking states
            const currentMarking = wordMarkings.get(wordKey) ?? null;
            const currentIndex = MARKING_CYCLE.indexOf(currentMarking);
            const nextIndex = (currentIndex + 1) % MARKING_CYCLE.length;
            const nextMarking = MARKING_CYCLE[nextIndex] ?? null;
            
            console.log(`Word "${rect.wordText}": ${currentMarking ?? 'none'} → ${nextMarking ?? 'none'}`);
            setWordMarking(wordKey, nextMarking);
          } else {
            // Tooltip mode: show tooltip
            const adjustedY = rect.y + rect.height * 0.7;
            setTooltip({
              visible: true,
              position: {
                x: rect.x,
                y: adjustedY,
                width: rect.width,
              },
              wordIndex: rect.wordIndex,
              lineIndex: rect.lineIndex,
              wordText: rect.wordText,
            });
          }
          return;
        }
      }
      
      // No word found at tap position, close tooltip if open
      if (tooltip.visible) {
        setTooltip(prev => ({ ...prev, visible: false }));
      }
    }, [wordRects, tooltip.visible, interactionMode, wordMarkings, pageIndex, setWordMarking]);

    const handleCloseTooltip = useCallback(() => {
      setTooltip(prev => ({ ...prev, visible: false }));
    }, []);

    const handleHifz = useCallback(() => {
      console.log('Hifz pressed for word:', tooltip.wordText, 'at line:', tooltip.lineIndex);
    }, [tooltip.wordText, tooltip.lineIndex]);

    const handleTajweed = useCallback(() => {
      console.log('Tajweed pressed for word:', tooltip.wordText, 'at line:', tooltip.lineIndex);
    }, [tooltip.wordText, tooltip.lineIndex]);

    // Get marked word rects for rendering
    const markedWordRects = useMemo(() => {
      const marked: { rect: WordRect; marking: WordMarkingType }[] = [];
      for (const rect of wordRects) {
        const wordKey = getWordKey(pageIndex, rect.lineIndex, rect.wordIndex);
        const marking = wordMarkings.get(wordKey);
        if (marking) {
          marked.push({ rect, marking });
        }
      }
      return marked;
    }, [wordRects, wordMarkings, pageIndex]);

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
        <Pressable style={styles.canvas} onPress={handlePress}>
          <Canvas style={styles.canvas}>
            {/* Render word markings (behind text) */}
            {markedWordRects.map(({ rect, marking }) => {
              const config = MARKING_CONFIG[marking];
              
              // Offset adjustments to align highlight with actual rendered text
              // Tune these values based on visual testing
              const xOffset = 0; // Positive = move right, Negative = move left
              const yOffset = rect.height * 0.4; // Move down to align with text baseline area
              
              // Highlight dimensions
              const paddingH = 4;
              const paddingV = 4;
              const highlightHeight = layout.fontSize * 1.2; // Base on font size, not line height
              
              const highlightX = rect.x + xOffset - paddingH;
              const highlightY = rect.y + yOffset - paddingV;
              const highlightWidth = rect.width + paddingH * 2;
              const totalHeight = highlightHeight + paddingV * 2;
              
              return (
                <Group key={`marking-${rect.lineIndex}-${rect.wordIndex}`}>
                  {/* Oval highlight behind word */}
                  <RoundedRect
                    x={highlightX}
                    y={highlightY}
                    width={highlightWidth}
                    height={totalHeight}
                    r={totalHeight / 2}
                    color={config.color}
                  />
                </Group>
              );
            })}
            
            {/* Render paragraphs (text) */}
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
        </Pressable>
        
        {interactionMode === 'tooltip' && (
          <WordTooltip
            visible={tooltip.visible}
            position={tooltip.position}
            onClose={handleCloseTooltip}
            onHifz={handleHifz}
            onTajweed={handleTajweed}
          />
        )}
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
