import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ColorScheme } from '../constants/Types';

interface UltraMicroModalProps {
  visible: boolean;
  anchorTitle: string;
  ultraMicro: string;
  colors: ColorScheme;
  onClose: () => void;
}

export default function UltraMicroModal({
  visible,
  anchorTitle,
  ultraMicro,
  colors,
  onClose,
}: UltraMicroModalProps) {
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {anchorTitle}
          </Text>
          <Text style={[styles.ultraMicro, { color: colors.dim }]}>
            {ultraMicro}
          </Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 16,
    padding: 24,
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  ultraMicro: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
