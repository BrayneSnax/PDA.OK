import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ColorScheme, ContainerId } from '../constants/Types';

interface ShiftToastProps {
  isVisible: boolean;
  colors: ColorScheme;
  container: ContainerId;
  onDismiss: () => void;
}

// Warm exhale messages for "did it" / Align Flow
const warmExhaleMessages = [
  'Completion hums softly through the weave.',
  'The field takes notice; a small current turns.',
  'You touched the thread and it remembered you.',
  'The act lands; resonance thickens.',
  'One quiet hinge opens a wider door.',
  'Momentum gathers exactly where you are.',
  'A simple Yes ripples the system.',
  'Presence clicks into place; carry on.',
];

let messageIndex = 0;

const getWarmExhaleMessage = () => {
  const message = warmExhaleMessages[messageIndex];
  messageIndex = (messageIndex + 1) % warmExhaleMessages.length;
  return message;
};

// Get time-of-day background color for toast
const getToastBackground = (container: ContainerId) => {
  const backgrounds = {
    morning: '#D4A574E6',
    afternoon: '#5FA8B8E6',
    evening: '#E8B4A8E6',
    late: '#8B9DC3E6',
  };
  return backgrounds[container] || backgrounds.morning;
};

export const ShiftToast: React.FC<ShiftToastProps> = ({ 
  isVisible, 
  colors,
  container,
  onDismiss 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current; // Slide up from bottom
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const messageRef = useRef<string>('');

  useEffect(() => {
    if (isVisible) {
      // Get message only when toast becomes visible
      messageRef.current = getWarmExhaleMessage();
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      scaleAnim.setValue(0.95);

      // Fade in and slide up gently
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 2 seconds (matching "did it" duration)
      const timer = setTimeout(() => {
        dismissToast();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 20,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!isVisible && fadeAnim._value === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={dismissToast}
        style={[
          styles.toast,
          { 
            backgroundColor: getToastBackground(container),
            borderColor: colors.accent + '30',
          },
        ]}
      >
        <Text style={[styles.text, { color: colors.text }]}>
          {messageRef.current}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 1001,
    alignItems: 'center',
  },

  toast: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: 18,
  },
});
