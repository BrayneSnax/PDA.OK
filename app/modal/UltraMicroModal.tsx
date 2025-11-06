import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ColorScheme, ContainerId } from '../constants/Types';

interface UltraMicroModalProps {
  visible: boolean;
  anchorTitle: string;
  ultraMicro: string;
  colors: ColorScheme;
  container: ContainerId;
  onClose: () => void;
}

// Time-of-day color theming for modal background
const getTimeGlowStyle = (container: ContainerId) => {
  const glowStyles = {
    morning: {
      backgroundColor: 'rgba(212, 165, 116, 0.35)', // Honey/amber at 35%
      borderColor: 'rgba(212, 165, 116, 0.5)',
    },
    afternoon: {
      backgroundColor: 'rgba(95, 168, 184, 0.35)', // Teal/aqua at 35%
      borderColor: 'rgba(95, 168, 184, 0.5)',
    },
    evening: {
      backgroundColor: 'rgba(140, 75, 63, 0.35)', // Rose at 35%
      borderColor: 'rgba(140, 75, 63, 0.5)',
    },
    late: {
      backgroundColor: 'rgba(58, 63, 69, 0.4)', // Indigo at 40%
      borderColor: 'rgba(58, 63, 69, 0.6)',
    },
  };

  return glowStyles[container] || glowStyles.morning;
};

export default function UltraMicroModal({
  visible,
  anchorTitle,
  ultraMicro,
  colors,
  container,
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

  const timeGlow = getTimeGlowStyle(container);

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
        <View style={[
          styles.modalContainer,
          {
            backgroundColor: timeGlow.backgroundColor,
            borderColor: timeGlow.borderColor,
          }
        ]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {anchorTitle}
          </Text>
          <Text style={[styles.ultraMicro, { color: colors.text }]}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Lighter overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 12, // Slightly tighter radius
    paddingVertical: 16, // Reduced from 24
    paddingHorizontal: 20, // Reduced from 24
    maxWidth: 280, // Reduced from 320
    width: '85%', // Tighter width
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 17, // Reduced from 20
    fontWeight: '600',
    marginBottom: 8, // Reduced from 12
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  ultraMicro: {
    fontSize: 14, // Reduced from 16
    lineHeight: 20, // Reduced from 24
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: -0.1,
  },
});
