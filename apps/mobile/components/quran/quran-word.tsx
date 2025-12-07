/**
 * QuranWord - Individual word component with long-press tooltip support
 */

import React, { useRef, useCallback } from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
  View,
  LayoutChangeEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface QuranWordProps {
  word: string;
  fontSize: number;
  lineHeight: number;
  isLastWord?: boolean;
  onLongPress: (position: { x: number; y: number; width: number }) => void;
}

export function QuranWord({
  word,
  fontSize,
  lineHeight,
  isLastWord = false,
  onLongPress,
}: QuranWordProps) {
  const wordRef = useRef<View>(null);

  const handleLongPress = useCallback(() => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Measure the word's position
    wordRef.current?.measureInWindow((x, y, width, height) => {
      onLongPress({ x, y, width });
    });
  }, [onLongPress]);

  return (
    <Pressable
      ref={wordRef}
      onLongPress={handleLongPress}
      delayLongPress={400}
      style={styles.wordContainer}
    >
      <Text
        style={[
          styles.word,
          {
            fontSize,
            lineHeight,
          },
        ]}
      >
        {word}{!isLastWord ? ' ' : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wordContainer: {
    // Keep words inline
  },
  word: {
    fontFamily: 'DigitalKhatt',
    color: '#1a1a1a',
    writingDirection: 'rtl',
  },
});

export default QuranWord;

