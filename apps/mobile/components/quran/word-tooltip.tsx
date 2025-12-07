/**
 * WordTooltip - iOS-style tooltip menu for Quran words
 */

import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TooltipPosition {
  x: number;
  y: number;
  width: number;
}

interface WordTooltipProps {
  visible: boolean;
  position: TooltipPosition;
  onClose: () => void;
  onHifz?: () => void;
  onTajweed?: () => void;
}

const TOOLTIP_HEIGHT = 44;
const ARROW_SIZE = 8;
const TOOLTIP_PADDING = 16;

export function WordTooltip({
  visible,
  position,
  onClose,
  onHifz,
  onTajweed,
}: WordTooltipProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity, scale]);

  if (!visible) return null;

  // Calculate tooltip position - center it above the word
  const tooltipWidth = 140;
  let tooltipX = position.x + position.width / 2 - tooltipWidth / 2;
  
  // Keep tooltip within screen bounds
  if (tooltipX < TOOLTIP_PADDING) {
    tooltipX = TOOLTIP_PADDING;
  } else if (tooltipX + tooltipWidth > SCREEN_WIDTH - TOOLTIP_PADDING) {
    tooltipX = SCREEN_WIDTH - TOOLTIP_PADDING - tooltipWidth;
  }

  const tooltipY = position.y - TOOLTIP_HEIGHT - ARROW_SIZE - 8;

  // Calculate arrow position relative to tooltip
  const arrowX = position.x + position.width / 2 - tooltipX - ARROW_SIZE;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.tooltipContainer,
            {
              left: tooltipX,
              top: tooltipY,
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          {/* Tooltip body */}
          <View style={styles.tooltip}>
            <TouchableOpacity
              style={styles.tooltipButton}
              onPress={() => {
                onHifz?.();
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.tooltipButtonText}>Hifz</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity
              style={styles.tooltipButton}
              onPress={() => {
                onTajweed?.();
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.tooltipButtonText}>Tajweed</Text>
            </TouchableOpacity>
          </View>
          
          {/* Arrow pointing down */}
          <View style={[styles.arrow, { left: Math.max(8, Math.min(arrowX, tooltipWidth - ARROW_SIZE * 2 - 8)) }]} />
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tooltipContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  tooltip: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  tooltipButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    backgroundColor: '#48484A',
    marginVertical: 8,
  },
  arrow: {
    position: 'absolute',
    bottom: -ARROW_SIZE,
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderTopWidth: ARROW_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#2C2C2E',
  },
});

export default WordTooltip;

