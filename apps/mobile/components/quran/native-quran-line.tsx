/**
 * NativeQuranLine - Native Text-based line with word-level long-press support
 * Uses adjustsFontSizeToFit to ensure consistent layout across all lines
 */

import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { QuranWord } from './quran-word';
import { WordTooltip } from './word-tooltip';

interface NativeQuranLineProps {
  lineText: string;
  fontSize: number;
  lineHeight: number;
  contentWidth: number;
  isCentered: boolean;
  isSurahName: boolean;
  isBasmallah: boolean;
}

interface TooltipState {
  visible: boolean;
  position: { x: number; y: number; width: number };
  wordIndex: number;
}


export function NativeQuranLine({
  lineText,
  fontSize,
  lineHeight,
  contentWidth,
  isCentered,
  isSurahName,
  isBasmallah,
}: NativeQuranLineProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    position: { x: 0, y: 0, width: 0 },
    wordIndex: -1,
  });
  const lineRef = useRef<View>(null);

  // Split line into words for selection
  const words = useMemo(() => lineText.split(' ').filter(w => w.length > 0), [lineText]);

  const handleWordLongPress = useCallback((wordIndex: number, position: { x: number; y: number; width: number }) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Show tooltip with arrow pointing to the word's center
    // The tooltip expects position.x to be the left edge, and calculates center as x + width/2
    setTooltip({
      visible: true,
      position: {
        x: position.x, // Word left edge X position
        y: position.y, // Word Y position
        width: position.width, // Word width for accurate arrow positioning
      },
      wordIndex,
    });
  }, []);

  const handleCloseTooltip = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  const handleHifz = useCallback(() => {
    console.log('Hifz pressed for word:', words[tooltip.wordIndex]);
    // TODO: Implement Hifz functionality
  }, [tooltip.wordIndex, words]);

  const handleTajweed = useCallback(() => {
    console.log('Tajweed pressed for word:', words[tooltip.wordIndex]);
    // TODO: Implement Tajweed functionality
  }, [tooltip.wordIndex, words]);

  // For special lines (surah name, basmallah), use simple centered Text
  const isSpecialLine = isSurahName || isBasmallah;

  // For special lines, use the original single Text approach
  if (isSpecialLine) {
    return (
      <View 
        ref={lineRef}
        style={[styles.lineContainer, { width: contentWidth }]}
      >
        <Text
          style={[
            styles.arabicText,
            {
              fontSize,
              lineHeight,
              width: contentWidth,
            },
            styles.centeredLine,
            isSurahName && styles.surahName,
            isBasmallah && styles.basmallah,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {lineText}
        </Text>
      </View>
    );
  }

  // For regular lines, render words individually for accurate positioning
  return (
    <View 
      ref={lineRef}
      style={[
        styles.lineContainer, 
        { width: contentWidth },
        isCentered ? styles.centeredContainer : styles.rightAlignedContainer,
      ]}
    >
      <View style={styles.wordsContainer}>
        {words.map((word, index) => (
          <QuranWord
            key={index}
            word={word}
            fontSize={fontSize}
            lineHeight={lineHeight}
            isLastWord={index === words.length - 1}
            onLongPress={(position) => handleWordLongPress(index, position)}
          />
        ))}
      </View>
      
      <WordTooltip
        visible={tooltip.visible}
        position={tooltip.position}
        onClose={handleCloseTooltip}
        onHifz={handleHifz}
        onTajweed={handleTajweed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  lineContainer: {
    alignItems: 'stretch',
  },
  wordsContainer: {
    flexDirection: 'row-reverse', // RTL layout
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  rightAlignedContainer: {
    alignItems: 'flex-end',
  },
  centeredContainer: {
    alignItems: 'center',
  },
  arabicText: {
    fontFamily: 'DigitalKhatt',
    color: '#1a1a1a',
    writingDirection: 'rtl',
  },
  centeredLine: {
    textAlign: 'center',
  },
  surahName: {
    color: '#1a5f4a',
    marginVertical: 4,
  },
  basmallah: {
    color: '#1a1a1a',
    marginVertical: 4,
  },
});

export default NativeQuranLine;
