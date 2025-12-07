/**
 * NativeQuranLine - Native Text-based line with word-level long-press support
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
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

  // Split line into words
  const words = lineText.split(' ').filter(w => w.length > 0);
  
  // Refs for measuring word positions
  const wordRefs = useRef<(View | null)[]>([]);

  const handleWordLongPress = useCallback((wordIndex: number) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Measure the word's position
    const wordRef = wordRefs.current[wordIndex];
    if (wordRef) {
      wordRef.measureInWindow((x, y, width, height) => {
        setTooltip({
          visible: true,
          position: { x, y, width },
          wordIndex,
        });
      });
    }
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

  // For special lines (surah name, basmallah) or short lines, use simple Text
  const isSpecialLine = isSurahName || isBasmallah;
  
  if (isSpecialLine) {
    return (
      <View style={[styles.lineContainer, { width: contentWidth }]}>
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
        >
          {lineText}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.lineContainer, { width: contentWidth }]}>
      <View
        style={[
          styles.wordsContainer,
          {
            width: contentWidth,
          },
          isCentered ? styles.centeredWords : styles.justifiedWords,
        ]}
      >
        {words.map((word, index) => (
          <Pressable
            key={index}
            ref={(ref) => { wordRefs.current[index] = ref; }}
            onLongPress={() => handleWordLongPress(index)}
            delayLongPress={350}
            style={({ pressed }) => [
              styles.wordPressable,
              pressed && styles.wordPressed,
            ]}
          >
            <Text
              style={[
                styles.arabicText,
                {
                  fontSize,
                  lineHeight,
                },
              ]}
            >
              {word}
              {index < words.length - 1 ? ' ' : ''}
            </Text>
          </Pressable>
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
    flexDirection: 'row-reverse', // RTL
    flexWrap: 'wrap',
  },
  justifiedWords: {
    justifyContent: 'flex-start', // Start from right in RTL
  },
  centeredWords: {
    justifyContent: 'center',
  },
  wordPressable: {
    // Inline display
  },
  wordPressed: {
    backgroundColor: 'rgba(26, 95, 74, 0.1)',
    borderRadius: 4,
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

