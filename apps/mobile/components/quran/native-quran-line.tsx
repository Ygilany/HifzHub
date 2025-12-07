/**
 * NativeQuranLine - Native Text-based line with word-level long-press support
 * Uses adjustsFontSizeToFit to ensure consistent layout across all lines
 */

import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WordPickerModal } from './word-picker-modal';
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
  const [showWordPicker, setShowWordPicker] = useState(false);
  const lineRef = useRef<View>(null);

  // Split line into words for selection
  const words = useMemo(() => lineText.split(' ').filter(w => w.length > 0), [lineText]);

  const handleLongPress = useCallback(() => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Show word picker modal
    setShowWordPicker(true);
  }, []);

  const handleWordSelected = useCallback((wordIndex: number) => {
    setShowWordPicker(false);
    
    // Show tooltip for the selected word
    // Position it in the center of the line
    lineRef.current?.measureInWindow((x, y, width) => {
      setTooltip({
        visible: true,
        position: { 
          x: x + width / 2 - 30, // Center approximately
          y: y,
          width: 60,
        },
        wordIndex,
      });
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

  return (
    <View 
      ref={lineRef}
      style={[styles.lineContainer, { width: contentWidth }]}
    >
      <Pressable
        onLongPress={handleLongPress}
        delayLongPress={400}
        style={({ pressed }) => [
          styles.linePressable,
          pressed && styles.linePressed,
        ]}
      >
        <Text
          style={[
            styles.arabicText,
            {
              fontSize,
              lineHeight,
              width: contentWidth,
            },
            isCentered || isSpecialLine ? styles.centeredLine : styles.rightAlignedLine,
            isSurahName && styles.surahName,
            isBasmallah && styles.basmallah,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {lineText}
        </Text>
      </Pressable>
      
      <WordPickerModal
        visible={showWordPicker}
        words={words}
        onSelectWord={handleWordSelected}
        onClose={() => setShowWordPicker(false)}
      />
      
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
  linePressable: {
    // Full width touchable area
  },
  linePressed: {
    backgroundColor: 'rgba(26, 95, 74, 0.05)',
    borderRadius: 4,
  },
  arabicText: {
    fontFamily: 'DigitalKhatt',
    color: '#1a1a1a',
    writingDirection: 'rtl',
  },
  rightAlignedLine: {
    textAlign: 'right',
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
