/**
 * WordPickerModal - Modal to select a word from a line after long-press
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';

interface WordPickerModalProps {
  visible: boolean;
  words: string[];
  onSelectWord: (wordIndex: number) => void;
  onClose: () => void;
}

export function WordPickerModal({
  visible,
  words,
  onSelectWord,
  onClose,
}: WordPickerModalProps) {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <Text style={styles.title}>اختر كلمة</Text>
            <Text style={styles.subtitle}>Select a word</Text>
            
            <ScrollView 
              style={styles.wordsScroll}
              contentContainerStyle={styles.wordsContainer}
              showsVerticalScrollIndicator={false}
            >
              {words.map((word, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.wordButton}
                  onPress={() => {
                    onSelectWord(index);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.wordText}>{word}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '70%',
  },
  modal: {
    backgroundColor: '#FFFEF5',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a5f4a',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  wordsScroll: {
    maxHeight: 300,
  },
  wordsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  wordButton: {
    backgroundColor: '#F5F5DC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0D0',
  },
  wordText: {
    fontFamily: 'DigitalKhatt',
    fontSize: 22,
    color: '#1a1a1a',
    writingDirection: 'rtl',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
});

export default WordPickerModal;

